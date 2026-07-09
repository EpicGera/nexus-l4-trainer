// Día especial por JSON: un día suelto (mismo contrato de bloques del programa,
// ver docs/GUIA-generar-programa-IA-externa.md) se agrega como pestaña ESPECIAL
// del día elegido. El original queda intacto; el wizard y todos los cálculos lo
// consumen como cualquier variación (deriveBlockMeta corre en el parse).
//
// Reuso deliberado: el día se envuelve en { w1: { days: [día] } } para pasar
// por el MISMO gate (auditProgram, Capa 1) y el MISMO parser del programa
// completo — cero contratos paralelos.

import { Database, DayVariation } from "../types/workout";
import { parseJsonToDatabase } from "./sheetImport";
import { auditProgram, AuditResult } from "./auditProgram";
import { parseDayId } from "./storageKeys";

export const SPECIAL_TAB = "ESPECIAL";

/** Audit + parse + extract compartido por el path JSON y el path TEXTO. */
function finalizeDay(dayObj: any): { variation: DayVariation; audit: AuditResult } {
  const day = Array.isArray(dayObj.variations)
    ? dayObj
    : { title: dayObj.title || "DÍA ESPECIAL", variations: [dayObj] };
  const audit = auditProgram({ w1: { days: [day] } });
  if (!audit.ok) {
    const first = audit.issues.find((i) => i.severity === "error");
    throw new Error(`El día no pasó la auditoría: ${first?.message ?? "errores en el contenido"}`);
  }
  const db = parseJsonToDatabase(JSON.stringify(audit.normalized));
  const v = db?.w1?.days?.[0]?.variations?.[0];
  const itemCount = v
    ? (v.blocks?.reduce((s, b) => s + b.items.length, 0) ??
      v.warmup.items.length + v.strength.items.length + v.metcon.items.length + v.accessories.items.length)
    : 0;
  if (!v || itemCount === 0) {
    throw new Error("No se encontraron ejercicios legibles.");
  }
  v.tabName = SPECIAL_TAB; // marcador único: una ESPECIAL por día
  return { variation: v, audit };
}

/**
 * Las IAs externas suelen devolver un PROGRAMA (canónico `{schemaVersion,weeks:[]}`
 * o legacy `{w1:{days:[]}}`) o un array de días, aunque se les pida un día suelto.
 * Desanida esas formas a un ÚNICO día; si traen N>1 días, error accionable (no
 * mis-anida silenciosamente). Cualquier otra forma pasa tal cual a finalizeDay.
 */
function unwrapDayCandidate(raw: any): any {
  const oneOrThrow = (days: any[], what: string): any => {
    const valid = days.filter((d) => d && typeof d === "object");
    if (valid.length === 1) return valid[0];
    throw new Error(
      `El archivo es un ${what} de ${valid.length} días. Para la pestaña ESPECIAL exportá UN solo día (ver docs/GUIA-dia-especial.md).`,
    );
  };

  // Array de días → 1 o error.
  if (Array.isArray(raw)) return oneOrThrow(raw, "array");

  if (raw && typeof raw === "object") {
    // Canónico: { schemaVersion, weeks: [{ days: [...] }] }
    if (Array.isArray(raw.weeks)) {
      const days = raw.weeks.flatMap((w: any) => (Array.isArray(w?.days) ? w.days : []));
      return oneOrThrow(days, "programa canónico");
    }
    // Legacy: { w1: { days: [...] } } o { w1: [...] } — con ≥1 clave de semana.
    const weekKeys = Object.keys(raw).filter((k) => /^w\d+$/i.test(k));
    if (weekKeys.length) {
      const days = weekKeys.flatMap((k) => {
        const wk = raw[k];
        return Array.isArray(wk) ? wk : Array.isArray(wk?.days) ? wk.days : [];
      });
      return oneOrThrow(days, "programa");
    }
  }

  return raw; // ya es un día suelto (o basura que finalizeDay reporta con claridad)
}

export function parseSpecialDayJson(text: string): { variation: DayVariation; audit: AuditResult } {
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("El archivo no es JSON válido.");
  }
  const day = unwrapDayCandidate(raw);
  if (!day || typeof day !== "object" || Array.isArray(day)) {
    throw new Error("El JSON debe ser un objeto de día (con variations o bloques bN_...).");
  }
  return finalizeDay(day);
}

// ── Parser de TEXTO PLANO ────────────────────────────────────────────────────
// Para armar un día especial (WOD de cumpleaños, evento del box, etc.) desde un
// .txt con los bloques identificados. Forgiving: reconoce encabezados por
// palabra clave y agrupa los ejercicios debajo. Ej:
//
//   TÍTULO: WOD Cumpleaños de Fulano
//   CALENTAMIENTO
//   3 rondas: 10 air squats, 10 push-ups
//   METCON: AMRAP 12
//   - 15 Cal Row
//   - 12 Wall Balls (9kg)
//   FUERZA
//   Back Squat 5x5 @ 80%

const BUCKET_DEF: { key: string; title: string; re: RegExp }[] = [
  { key: "b1_warmup", title: "01. WARM-UP", re: /(warm|calent|activaci|movil|calisten)/i },
  { key: "b2_strength", title: "02. FUERZA", re: /(fuerza|strength|lift|levantam|oly|halterof|gimnas|skill|t[eé]cnic)/i },
  { key: "b3_metcon", title: "03. METCON", re: /(metcon|wod|condicion|cardio|amrap|emom|for\s*time|por\s*tiempo|chipper|benchmark|hero)/i },
  { key: "b4_accessories", title: "04. ACCESORIOS", re: /(accesor|accessor|reinforce|finisher|cooldown|core|abdomin)/i },
];
const SCHEME_RE = /\b(amrap|emom|for\s*time|por\s*tiempo|cap|rondas?|rounds?|min\b|x\s*\d|tabata|e\d+mom|every)\b/i;
const stripBullet = (s: string) => s.replace(/^\s*(?:[-*•·▪]|\d+[.)])\s+/, "").trim();

/** ¿La línea es un encabezado de bloque? Devuelve la def, o null. */
function headerOf(line: string): { def: (typeof BUCKET_DEF)[number]; scheme: string } | null {
  const raw = line.replace(/^#{1,3}\s*/, "").trim();
  const wordCount = raw.split(/\s+/).length;
  const looksHeader = /^#{1,3}\s/.test(line) || /:/.test(raw) || raw === raw.toUpperCase() || wordCount <= 4;
  if (!looksHeader) return null;
  const beforeColon = raw.split(/[:\-–]/)[0];
  const def = BUCKET_DEF.find((d) => d.re.test(beforeColon)) || BUCKET_DEF.find((d) => d.re.test(raw));
  if (!def) return null;
  const afterColon = raw.includes(":") ? raw.slice(raw.indexOf(":") + 1).trim() : "";
  const scheme = afterColon && SCHEME_RE.test(afterColon) ? afterColon : "";
  return { def, scheme };
}

export function parseSpecialDayText(text: string): { variation: DayVariation; audit: AuditResult } {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new Error("El archivo de texto está vacío.");

  let title = "DÍA ESPECIAL";
  const blocks: Record<string, { title: string; scheme: string; items: string[] }> = {};
  let current: { key: string } | null = null;

  for (const line of lines) {
    const tMatch = line.match(/^#{0,3}\s*(?:t[íi]tulo|d[íi]a|day|title)\s*[:\-]\s*(.+)$/i);
    if (tMatch) { title = tMatch[1].trim(); continue; }

    const h = headerOf(line);
    if (h) {
      const b = (blocks[h.def.key] ||= { title: h.def.title, scheme: "", items: [] });
      if (h.scheme) b.scheme = h.scheme;
      current = { key: h.def.key };
      continue;
    }

    // línea de contenido. Si parece un esquema suelto y el bloque no tiene uno, lo toma.
    if (current) {
      const b = blocks[current.key];
      if (!b.scheme && SCHEME_RE.test(line) && line.split(/\s+/).length <= 6) { b.scheme = line; continue; }
      // "3 rondas: a, b, c" o "a, b, c" → items separados por coma
      const body = stripBullet(line.replace(/^\d+\s*rondas?\s*:?/i, "").trim());
      body.split(/\s*,\s*|\s*;\s*/).map(stripBullet).filter((x) => x.length > 1).forEach((it) => b.items.push(it));
    } else {
      // contenido antes de cualquier encabezado → cae a metcon (WOD suelto)
      const b = (blocks.b3_metcon ||= { title: "03. METCON", scheme: "", items: [] });
      stripBullet(line).split(/\s*,\s*/).map(stripBullet).filter((x) => x.length > 1).forEach((it) => b.items.push(it));
    }
  }

  if (!Object.keys(blocks).length) {
    throw new Error("No se reconoció ningún bloque en el texto. Usá encabezados como CALENTAMIENTO / FUERZA / METCON / ACCESORIOS.");
  }
  return finalizeDay({ title, ...blocks });
}

/** Detecta el formato y parsea (JSON o texto plano). */
export function parseSpecialDay(text: string): { variation: DayVariation; audit: AuditResult } {
  const t = text.trim();
  return t.startsWith("{") || t.startsWith("[") ? parseSpecialDayJson(t) : parseSpecialDayText(t);
}

/** Agrega (o reemplaza) la pestaña ESPECIAL del día. Devuelve una base nueva. */
export function injectSpecialVariation(
  db: Database,
  dayId: string,
  variation: DayVariation,
): Database {
  return mapDay(db, dayId, (vars) => [...vars.filter((v) => v.tabName !== SPECIAL_TAB), variation]);
}

/** Quita la pestaña ESPECIAL del día (no-op si no hay). */
export function removeSpecialVariation(db: Database, dayId: string): Database {
  return mapDay(db, dayId, (vars) => vars.filter((v) => v.tabName !== SPECIAL_TAB));
}

export function hasSpecialVariation(db: Database, dayId: string): boolean {
  const parsed = parseDayId(dayId);
  const day = parsed ? db[`w${parsed.week}`]?.days?.find((d) => d.id === dayId) : null;
  return !!day?.variations?.some((v) => v.tabName === SPECIAL_TAB);
}

function mapDay(
  db: Database,
  dayId: string,
  fn: (vars: DayVariation[]) => DayVariation[],
): Database {
  const parsed = parseDayId(dayId);
  if (!parsed) return db;
  const wk = `w${parsed.week}`;
  const week = db[wk];
  if (!week) return db;
  return {
    ...db,
    [wk]: {
      ...week,
      days: week.days.map((d) => (d.id === dayId ? { ...d, variations: fn(d.variations) } : d)),
    },
  };
}
