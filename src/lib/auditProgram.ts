// Deterministic program-JSON auditor (Layer 1). Validates an AI-generated
// program against the Nexus contract and reports what the automatic reader can
// and can't parse, BEFORE it's imported — so a format drift surfaces as a clear
// report instead of silently breaking auto-fill or showing messy titles.
//
// It is pure and non-destructive: it returns a *normalized copy* (safe fixes:
// clean titles) plus a list of issues. It never rewrites exercise text (that
// would be guesswork) — it flags unreadable items for the author/AI to fix.
//
// Layering: this is the cheap, free, deterministic pass. A semantic AI auditor
// (balance/safety/repair) is a separate Layer 2 that runs only if this isn't
// enough.

import { prescribedReps, prescribedSeconds, prescribedKg, prescribedPct, detectInputMode } from "./inputSignals";
import { isCueOrNote } from "./cueDetection";
import { loggableBlockItems } from "./blockGrouping";
import { cleanBlockTitle } from "./titleClean";
import { resolveOrInfer } from "../data/exerciseCatalog";
import { parseWmPct } from "./workingMax";

export type AuditSeverity = "error" | "warning";

export interface AuditIssue {
  severity: AuditSeverity;
  where: string;
  message: string;
  /** what a safe auto-fix changed, when applicable */
  fix?: string;
}

export interface AuditResult {
  /** true when there are no hard errors (safe to import, possibly after fixes) */
  ok: boolean;
  issues: AuditIssue[];
  /** a normalized DEEP COPY with safe fixes applied (clean titles) */
  normalized: any;
  stats: {
    weeks: number;
    days: number;
    blocks: number;
    items: number;
    unreadableItems: number;
    titlesFixed: number;
    loadedWithoutLoad: number;
  };
}

const strip = (s: string) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Block buckets where the athlete logs per set, so each item must be readable. */
function isPerSetBlock(key: string, title: string): boolean {
  const s = strip(`${key} ${title}`);
  if (/(warm|calent|activaci|movil|recuper|metcon|wod|boss|amrap|for time|emom|interval|zona|continu|finisher|grunt)/.test(s)) {
    return false; // warmup / metcon-style → not per-set rep logging
  }
  return /(fuerza|strength|halterof|halter|snatch|clean|jerk|squat|deadlift|press|skill|habilidad|gimnas|gymnast|tecnic|olimpic|oly|accesor|hipertrof)/.test(s);
}

/** Can the automatic reader extract a loggable prescription from this item? */
function isReadableItem(item: string): boolean {
  if (isCueOrNote(item)) return true; // notes are expected, not a problem
  return (
    prescribedReps(item) != null ||
    prescribedSeconds(item) != null ||
    prescribedKg(item) != null
  );
}

/**
 * A weighted movement that doesn't declare its load. Loaded/loadedBodyweight
 * movements (barbell, DB, KB…) must carry a `% WM` (preferred) or explicit kg so
 * the load is WMD-anchored and scales. Returns the resolved kind for the message.
 */
function loadedWithoutLoad(item: string): boolean {
  if (isCueOrNote(item)) return false;
  // Bands/cables/jump-rope are resistance, not a kg/WMD load — never required.
  if (/\bbanda\b|\bband\b|el[áa]stic|cable|goma/i.test(item)) return false;
  const ex = resolveOrInfer(item);
  // Only FREE-WEIGHT external load (barbell/DB/KB). "loadedBodyweight" (weighted
  // pull-ups/dips/v-ups) is excluded — too ambiguous with plain bodyweight to
  // flag hard; the generator (Fase B) handles those.
  if (detectInputMode(item, ex) !== "loaded") return false;
  // Has ANY load reference? %WM (preferred), plain % (1RM), or explicit kg.
  return parseWmPct(item) == null && prescribedPct(item) == null && prescribedKg(item) == null;
}

/** True when the title carries cue/classification clutter cleanBlockTitle removes. */
function titleHasClutter(title: string): boolean {
  return /\(|\)|\[|\]/.test(String(title ?? ""));
}

// The tolerant program shape: weeks are { days: [...] } or a bare array; a day
// has variations[] (or block keys directly); blocks are fixed lanes or `bN_`.
function blockEntries(variation: any): { key: string; block: any }[] {
  if (!variation || typeof variation !== "object") return [];
  const out: { key: string; block: any }[] = [];
  // Canonical `blocks[]` array is what the importer actually uses, so audit/fix
  // THAT when present (a variation may carry both it and legacy lane keys).
  if (Array.isArray(variation.blocks) && variation.blocks.length) {
    variation.blocks.forEach((b: any, i: number) => {
      if (b && typeof b === "object" && Array.isArray(b.items)) {
        out.push({ key: b.key || `b${i + 1}`, block: b });
      }
    });
    return out;
  }
  for (const key of Object.keys(variation)) {
    if (key === "tabName" || key === "blocks") continue;
    const block = variation[key];
    if (block && typeof block === "object" && Array.isArray(block.items)) {
      out.push({ key, block });
    }
  }
  return out;
}

function variationsOf(day: any): any[] {
  if (Array.isArray(day?.variations)) return day.variations;
  // tolerant: a day may carry block keys directly (no variations wrapper)
  if (day && typeof day === "object") return [day];
  return [];
}

function daysOf(week: any): any[] {
  if (Array.isArray(week)) return week;
  if (Array.isArray(week?.days)) return week.days;
  return [];
}

export function auditProgram(raw: unknown): AuditResult {
  const issues: AuditIssue[] = [];
  const stats = { weeks: 0, days: 0, blocks: 0, items: 0, unreadableItems: 0, titlesFixed: 0, loadedWithoutLoad: 0 };

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    issues.push({ severity: "error", where: "root", message: "El JSON debe ser un objeto { w1: …, w2: … }." });
    return { ok: false, issues, normalized: raw, stats };
  }

  const weekKeys = Object.keys(raw as object).filter((k) => /^w\d+$/i.test(k));
  if (weekKeys.length === 0) {
    issues.push({ severity: "error", where: "root", message: "No hay claves de semana válidas (w1, w2, …)." });
    return { ok: false, issues, normalized: raw, stats };
  }

  const normalized = JSON.parse(JSON.stringify(raw)); // deep copy for safe fixes
  let totalLoggableItems = 0;
  const daysPerWeek: Record<string, number> = {};

  for (const wk of weekKeys) {
    stats.weeks++;
    const days = daysOf(normalized[wk]);
    daysPerWeek[wk] = days.length;
    days.forEach((day: any, di: number) => {
      stats.days++;
      const dayId = day?.id || `${wk.toLowerCase()}d${di + 1}`;
      const variations = variationsOf(day);
      variations.forEach((v: any) => {
        for (const { key, block } of blockEntries(v)) {
          stats.blocks++;
          const where = `${dayId} · ${block.title || key}`;

          // Safe fix: tidy the title.
          if (typeof block.title === "string" && titleHasClutter(block.title)) {
            const cleaned = cleanBlockTitle(block.title);
            if (cleaned !== block.title) {
              issues.push({ severity: "warning", where, message: "Título con cues/clasificación mezclados.", fix: `“${block.title}” → “${cleaned}”` });
              block.title = cleaned;
              stats.titlesFixed++;
            }
          }

          const perSet = isPerSetBlock(key, block.title || "");
          const rawItems = (block.items as any[]).map((x) => String(x ?? "")).filter((x) => x.trim());
          stats.items += rawItems.length;

          // Use the SAME role resolution the wizard logs with: headers and cues
          // are not loggable stations, so they're never "unreadable". Only
          // per-set blocks require each station to carry a parseable prescription.
          const loggable = loggableBlockItems(rawItems);
          totalLoggableItems += loggable.length;
          if (perSet) {
            // The wizard also reads reps/seconds from the block scheme ("2x6 @
            // 70kg" with no per-item tiers) — so a scheme-level prescription
            // makes every station readable.
            const schemeText = String(block.scheme ?? "");
            const schemeHasPrescription =
              prescribedReps(schemeText) != null || prescribedSeconds(schemeText) != null;
            // A block-level "% WM" / kg covers every station's load.
            const schemeHasLoad =
              parseWmPct(schemeText) != null || prescribedPct(schemeText) != null || prescribedKg(schemeText) != null;
            for (const st of loggable) {
              if (!schemeHasPrescription && !isReadableItem(st.text)) {
                stats.unreadableItems++;
                issues.push({
                  severity: "warning",
                  where: `${where} · ${st.name || st.text.slice(0, 30)}`,
                  message: `No legible automáticamente: “${st.text.slice(0, 60)}”. Escribí series/reps/carga/tiempo en el texto (ej. “Movimiento — 5×5 @ 60%” o “Hold — 3×20s”).`,
                });
              }
              // WMD guarantee: a weighted movement must declare its load (% WM > kg).
              if (!schemeHasLoad && loadedWithoutLoad(st.text)) {
                stats.loadedWithoutLoad++;
                issues.push({
                  severity: "warning",
                  where: `${where} · ${st.name || st.text.slice(0, 30)}`,
                  message: `Movimiento con peso sin carga WMD: “${st.text.slice(0, 60)}”. Prescribí la carga como “… @ Y% WM” (preferido) o un kg explícito, para que escale y autorregule.`,
                });
              }
            }
          }
        }
      });
    });
  }

  // Semana truncada: una semana con muchos menos días que las demás delata una
  // salida de IA cortada por longitud (el bug donde la w4 deload quedó con 1 día).
  // Warning, no error: hay bloques legítimamente asimétricos, pero el aviso queda
  // visible en el toast de instalación en vez de "desaparecer" una semana entera.
  const dayCounts = Object.values(daysPerWeek);
  if (dayCounts.length > 1) {
    const maxDays = Math.max(...dayCounts);
    for (const [wk, n] of Object.entries(daysPerWeek)) {
      if (maxDays >= 3 && n < maxDays - 1) {
        issues.push({
          severity: "warning",
          where: wk,
          message: `${wk} tiene ${n} día(s) y otras semanas tienen hasta ${maxDays} — ¿salida de IA truncada? Revisá que la semana esté completa antes de entrenar.`,
        });
      }
    }
  }

  if (totalLoggableItems === 0) {
    issues.push({ severity: "error", where: "root", message: "El programa no tiene ningún ejercicio loggable (todos los items están vacíos o son notas)." });
  } else if (stats.unreadableItems * 2 >= totalLoggableItems) {
    // Gate, not just advice: with most stations unreadable the program is
    // effectively unloggable — a handful of warnings is importable, this isn't.
    issues.push({
      severity: "error",
      where: "root",
      message: `${stats.unreadableItems} de ${totalLoggableItems} estaciones no son legibles automáticamente — corregí las prescripciones (series/reps/carga) antes de importar.`,
    });
  }

  const ok = !issues.some((i) => i.severity === "error");
  return { ok, issues, normalized, stats };
}
