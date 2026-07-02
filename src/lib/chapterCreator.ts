// Phase 4 — Chapter Creator foundation (pure + testable).
// CF-L4 principle: evaluation precedes prescription (NEXUSL4V7.MD caps. 28-29).
// evaluateAthlete() reads the structured sessions + derivation engine and produces
// a structured assessment (strengths, modal holes, weak skills, load/ACWR,
// recommended block intention) plus a human-readable summary that grounds the AI
// prompt. buildChapterPrompt() turns the request + evaluation into the instruction
// for the generator (see aiService.generateChapter — next step). The AI output is
// a Database (program) + new catalog movements + declared intention + witness
// metrics + themed bosses, all grounded in the encyclopedia.

import { loadSessions } from "./sessionStore";
import {
  sessionTotals,
  sessionLoadAU,
  estimate1RM,
  skillsRadar,
  modalMapCoverage,
  acwr,
  TimeDomain,
} from "./trainingEngine";
import { getBodyweightKg } from "./profileMetrics";
import { Modality, GeneralSkill } from "../types/training";
import { CATALOG } from "../data/exerciseCatalog";
import { Database, DayWorkout } from "../types/workout";

export type BlockIntention = "acumulacion" | "intensificacion" | "realizacion" | "restauracion";

const MODALITY_ES: Record<Modality, string> = { M: "Cardio (M)", G: "Gimnasia (G)", W: "Pesas (W)" };
const SKILL_ES: Record<GeneralSkill, string> = {
  cardio: "resistencia cardio", stamina: "stamina", strength: "fuerza", flexibility: "flexibilidad",
  power: "potencia", speed: "velocidad", coordination: "coordinación", agility: "agilidad",
  balance: "equilibrio", accuracy: "precisión",
};
const TD_ES: Record<TimeDomain, string> = { sprint: "sprint (<2′)", short: "corto (2–8′)", medium: "medio (8–20′)", long: "largo (>20′)" };
const TIME_DOMAINS: TimeDomain[] = ["sprint", "short", "medium", "long"];

export interface AthleteEvaluation {
  sessions: number;
  hasData: boolean;
  topPrs: { name: string; e1rmKg: number }[];
  modalBalancePct: Record<Modality, number>;
  /** modality×time-domain cells with no exposure — the athlete's holes (the Hopper) */
  modalHoles: string[];
  /** lowest-exposure general physical skills */
  weakestSkills: GeneralSkill[];
  acwr: number | null;
  recommendedIntention: BlockIntention;
  /** human-readable brief that grounds the AI prompt */
  summary: string;
}

export interface ChapterRequest {
  /** what the athlete says the bosses / semi-bosses are inspired by (lore) */
  bossInspiration: string;
  daysPerWeek: number;
  /** free-text equipment available */
  equipment?: string;
  /** optional override of the recommended block intention */
  blockIntention?: BlockIntention;
  /** optional session-length target in minutes */
  sessionMinutes?: number;
  /** when true, inject deep encyclopedia context into the AI system prompt */
  enriched?: boolean;
  /** compact summary of the CURRENT program, so the new chapter varies/progresses from it */
  previousProgramSummary?: string;
  /** which chapter this is (1 = first); drives progression + seeds local variation */
  chapterIndex?: number;
  /** rendered objective + gap-to-current-marks; drives progression toward the goal */
  objective?: string;
  /** rendered athlete load map (movement → kg) so the AI prescribes % WM */
  loads?: string;
}

export function evaluateAthlete(bw: number = getBodyweightKg()): AthleteEvaluation {
  const sessions = loadSessions();
  if (sessions.length === 0) {
    return {
      sessions: 0, hasData: false, topPrs: [], modalBalancePct: { M: 0, G: 0, W: 0 },
      modalHoles: [], weakestSkills: [], acwr: null, recommendedIntention: "acumulacion",
      summary:
        "Atleta sin historial registrado. Generar un CAPÍTULO DE EVALUACIÓN / LÍNEA DE BASE: " +
        "movimientos fundacionales, cargas técnicas (≤70%), cobertura de las 3 modalidades y de " +
        "todas las duraciones, sin volumen destructivo. Establecer marcas de referencia.",
    };
  }

  const modalityWorkJ: Record<Modality, number> = { M: 0, G: 0, W: 0 };
  const prs: Record<string, number> = {};
  const dailyLoads: Record<string, number> = {};

  for (const s of sessions) {
    const t = sessionTotals(s, bw);
    (Object.keys(modalityWorkJ) as Modality[]).forEach((m) => (modalityWorkJ[m] += t.modalityWorkJ[m]));
    const load = sessionLoadAU(s);
    if (load != null) dailyLoads[s.date] = (dailyLoads[s.date] || 0) + load;
    for (const set of s.sets) {
      const e = estimate1RM(set.weightKg, set.reps);
      if (e != null) prs[set.exerciseName] = Math.max(prs[set.exerciseName] || 0, e);
    }
  }

  const modalTotal = modalityWorkJ.M + modalityWorkJ.G + modalityWorkJ.W;
  const modalBalancePct: Record<Modality, number> = {
    M: modalTotal > 0 ? Math.round((modalityWorkJ.M / modalTotal) * 100) : 0,
    G: modalTotal > 0 ? Math.round((modalityWorkJ.G / modalTotal) * 100) : 0,
    W: modalTotal > 0 ? Math.round((modalityWorkJ.W / modalTotal) * 100) : 0,
  };

  const map = modalMapCoverage(sessions, bw);
  const modalHoles: string[] = [];
  (["M", "G", "W"] as Modality[]).forEach((m) => {
    TIME_DOMAINS.forEach((td) => {
      if (map[m][td] <= 0) modalHoles.push(`${MODALITY_ES[m]} · ${TD_ES[td]}`);
    });
  });

  const radar = skillsRadar(sessions);
  const weakestSkills = (Object.keys(SKILL_ES) as GeneralSkill[])
    .sort((a, b) => radar[a] - radar[b])
    .slice(0, 3);

  const today = new Date().toISOString().slice(0, 10);
  const loadDays = Object.keys(dailyLoads).length;
  const acwrVal = loadDays >= 7 ? acwr(dailyLoads, today) : null;

  const recommendedIntention: BlockIntention =
    acwrVal != null && acwrVal > 1.4 ? "restauracion"
    : sessions.length < 8 ? "acumulacion"
    : "intensificacion";

  const topPrs = Object.entries(prs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, e1rmKg]) => ({ name, e1rmKg: Math.round(e1rmKg) }));

  const summary = [
    `Historial: ${sessions.length} sesión(es).`,
    `Balance modal por trabajo — Cardio ${modalBalancePct.M}% · Gimnasia ${modalBalancePct.G}% · Pesas ${modalBalancePct.W}%.`,
    topPrs.length ? `Mejores e1RM: ${topPrs.map((p) => `${p.name} ${p.e1rmKg}kg`).join(", ")}.` : "Sin e1RM de fuerza registrados.",
    weakestSkills.length ? `Skills más flojas (por exposición): ${weakestSkills.map((s) => SKILL_ES[s]).join(", ")}.` : "",
    modalHoles.length ? `Huecos del mapa modal (atacar): ${modalHoles.slice(0, 6).join("; ")}.` : "Cobertura modal/temporal completa.",
    acwrVal != null ? `ACWR ${acwrVal} (${acwrVal > 1.5 ? "riesgo alto — priorizar restauración" : acwrVal > 1.3 ? "vigilar carga" : acwrVal < 0.8 ? "subcarga, puede subir volumen" : "zona óptima"}).` : "ACWR sin base aún (necesita ~4 semanas).",
    `Intención de bloque recomendada: ${recommendedIntention}.`,
  ].filter(Boolean).join(" ");

  return {
    sessions: sessions.length, hasData: true, topPrs, modalBalancePct, modalHoles,
    weakestSkills, acwr: acwrVal, recommendedIntention, summary,
  };
}

/**
 * Build the generator instruction, grounded in the NEXUS encyclopedia. The
 * generated chapter must: declare a block intention + 2–3 witness metrics
 * (HWPO), lay out the week per daysPerWeek with interference management and a
 * weakness slot (Mayhem/PRVN), cover the 3 energy systems with an aerobic base,
 * theme the day names/bosses from the athlete's inspiration, and honor the
 * safety veto hierarchy. Output is strict JSON.
 */
export function buildChapterPrompt(req: ChapterRequest, evaluation: AthleteEvaluation): string {
  const intention = req.blockIntention || evaluation.recommendedIntention;
  return [
    "Generá un CAPÍTULO (programa mensual de 4 semanas) de CrossFit fundamentado en la metodología NEXUS",
    "(Mayhem: disponibilidad + microciclo que respira; PRVN: cobertura de espectro + slot de debilidad + pacing;",
    "HWPO: intención de bloque declarada + métricas testigo; CF-L4: mecánica→consistencia→intensidad, escalado",
    "que preserva el estímulo, jerarquía de veto salud>recuperación>adherencia).",
    "",
    `DÍAS POR SEMANA: ${req.daysPerWeek}.` + (req.sessionMinutes ? ` Duración objetivo por sesión: ${req.sessionMinutes} min.` : ""),
    req.equipment ? `MATERIAL DISPONIBLE: ${req.equipment}.` : "MATERIAL: estándar de box CrossFit.",
    `INTENCIÓN DE BLOQUE: ${intention}.`,
    `INSPIRACIÓN DE BOSSES / SEMI-BOSSES (temática de los días, leitmotif EL ABISMO): ${req.bossInspiration}.`,
    `ESTE ES EL CAPÍTULO #${req.chapterIndex ?? 2} (no el primero): debe PROGRESAR y VARIAR respecto al anterior.`,
    "",
    req.previousProgramSummary
      ? "PROGRAMA ANTERIOR (variá fuerte respecto a esto — NO repitas los mismos WODs ni los mismos levantamientos en el mismo orden):\n" + req.previousProgramSummary
      : "No hay programa anterior registrado; es la línea de base.",
    "",
    "EVALUACIÓN DEL ATLETA (la prescripción debe responder a esto):",
    evaluation.summary,
    "",
    req.objective
      ? "OBJETIVO DEL ATLETA (el hilo — este capítulo debe ser el PRÓXIMO PASO hacia esto; atacá la brecha en condiciones favorables, en fresco, sin romper la periodización ni el veto salud>recuperación>adherencia):\n" + req.objective
      : "Sin objetivo declarado: periodizá desde la evaluación.",
    "",
    req.loads
      ? "CARGAS DEL ATLETA (Working Max base — prescribí % WM sobre estas):\n" + req.loads
      : "Sin cargas registradas; igual prescribí % WM y el atleta cargará sus marcas.",
    "",
    "REQUISITOS DE SALIDA:",
    "- CARGA OBLIGATORIA VÍA WMD: TODO movimiento que use peso (barra, mancuernas, kettlebell, balón, lastre) se prescribe SIEMPRE con su carga como `% WM` — ej. \"Back Squat — 4×6 @ 70% WM\", \"KB Swing — 20 reps @ 100% WM\", \"V-up lastrado — 3×12 @ 60% WM\". La app calcula el kg desde la carga del atleta. NUNCA dejes un movimiento con peso sin carga, ni uses kg absoluto si hay base WMD.",
    "- VARIABILIDAD OBLIGATORIA: rotá los levantamientos principales, cambiá rangos de reps/%/dominios temporales y combinaciones de metcon respecto al programa anterior. Dos capítulos no pueden parecerse.",
    "- PROGRESIÓN: si el anterior fue acumulación, subí intensidad; respetá la periodización (semana 4 = deload).",
    "- Atacá las debilidades y los huecos del mapa modal nombrados arriba, en condiciones favorables (en fresco).",
    "- Base aeróbica como mayor parte del acondicionamiento; el glucolítico al fallo se dosifica con avaricia.",
    "- Técnico en fresco; nunca fuerza máxima tras un esfuerzo glucolítico devastador.",
    "- Cada metcon declara su dominio temporal y sistema energético; gestioná la interferencia.",
    "- Cargas mayoritariamente técnicas (≤85%); fuerza a 2–3 reps del fallo.",
    "",
    "Respondé SOLO JSON con esta forma:",
    '{ "blockIntention": "...", "witnessMetrics": ["...","..."], "lore": "tema narrativo del capítulo",',
    '  "program": { "w1": { "days": [ { "name":"LUNES", "title":"<boss/lore>", "variations":[ { "tabName":"ÚNICO",',
    '    "warmup":{"title":"01. WARM-UP","scheme":"","items":["..."]},',
    '    "strength":{"title":"02. FUERZA","scheme":"4x5 @ 70%","items":["Back Squat"]},',
    '    "metcon":{"title":"03. METCON","scheme":"AMRAP 12","items":["15 Wall Balls","12 Pull-ups"]},',
    '    "accessories":{"title":"04. ACCESORIOS","scheme":"3 Series","items":["..."]} } ] } , ... 7 días ] }, "w2":{...}, "w3":{...}, "w4":{...} },',
    '  "newMovements": [ { "name":"...", "modality":"M|G|W", "pattern":"squat|hinge|...", "note":"por qué se incluye" } ] }',
    "El programa debe tener w1..w4, cada una con los días que correspondan a los días/semana (el resto, descanso/recuperación activa).",
  ].join("\n");
}

// ── Local generator (offline / no-AI fallback) ──────────────────────────────
// A real, periodized, VARIED program built from the catalog. Seeded so each
// chapter differs (the old fallback returned the same neutral template, which
// is why chapter 2 looked identical to chapter 1). Rotates lifts, varies
// schemes by block intention + week, themes day titles from the inspiration.

const DAY_NAMES = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

function rngFrom(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function pickName(arr: { name: string }[], r: () => number, fallback: string): string {
  return arr.length ? arr[Math.floor(r() * arr.length)].name : fallback;
}

export function localChapterProgram(
  req: ChapterRequest,
  evaluation: AthleteEvaluation,
  seed: number = Date.now(),
): { program: Database; blockIntention: BlockIntention; witnessMetrics: string[]; lore: string } {
  const r = rngFrom(seed + (req.chapterIndex || 0) * 7919);
  const intention = (req.blockIntention || evaluation.recommendedIntention) as BlockIntention;
  const cat = CATALOG;
  const liftRotation = [
    cat.filter((e) => e.pattern === "squat" && e.modality === "W"),
    cat.filter((e) => e.pattern === "olympic"),
    cat.filter((e) => e.pattern === "hinge" && e.modality === "W"),
    cat.filter((e) => e.pattern === "vertical-push" && e.modality === "W"),
    cat.filter((e) => e.pattern === "vertical-pull"),
    cat.filter((e) => e.pattern === "horizontal-push"),
  ];
  const cardio = cat.filter((e) => e.modality === "M");
  const gym = cat.filter((e) => e.modality === "G" && e.pattern !== "core");
  const lightW = cat.filter((e) => e.modality === "W" && ["squat", "olympic", "hinge"].includes(e.pattern));
  const accessory = cat.filter((e) => e.pattern === "core" || e.pattern === "carry" || e.unilateral);

  const strengthScheme = (w: number): string => {
    if (intention === "restauracion" || w === 4) return `3x5 @ ${50 + w * 2}% WM (deload)`;
    if (intention === "intensificacion") return `${[5, 4, 3][w - 1] || 4}x${[5, 4, 3][w - 1] || 3} @ ${[75, 80, 85][w - 1] || 80}% WM`;
    if (intention === "realizacion") return `${[3, 2, 2][w - 1] || 2} @ ${[85, 88, 90][w - 1] || 88}% WM`;
    return `4x${[8, 8, 10][w - 1] || 8} @ ${[65, 68, 70][w - 1] || 67}% WM`; // acumulación
  };
  const metconFormats = [
    "AMRAP 12 MIN", "For Time | Cap 14:00", "EMOM 16 MIN", "21-15-9",
    "AMRAP 8 MIN", "5 Rondas Por Tiempo", "Por Tiempo | Cap 20:00",
  ];
  const repPool = [21, 18, 15, 12, 10, 9];
  const theme = (req.bossInspiration || "Acto").trim().split(/\s+/).slice(0, 4).join(" ");

  const program: Database = {};
  for (let w = 1; w <= 4; w++) {
    const days: DayWorkout[] = [];
    for (let d = 1; d <= 7; d++) {
      const id = `w${w}d${d}`;
      if (d > req.daysPerWeek) {
        days.push({
          id, name: DAY_NAMES[d - 1], title: "Descanso activo", isCompleted: false, hasTabs: false,
          variations: [{
            tabName: "ÚNICO",
            warmup: { title: "01. WARM-UP", scheme: "", items: ["Movilidad general"] },
            strength: { title: "02. FUERZA", scheme: "", items: [] },
            metcon: { title: "03. METCON", scheme: "Zona 2", items: ["20-30 min aeróbico suave (opcional)"] },
            accessories: { title: "04. ACCESORIOS", scheme: "", items: ["Respiración / estiramiento"] },
          }],
        });
        continue;
      }
      const lift = pickName(liftRotation[(d + w) % liftRotation.length], r, "Back Squat");
      const reps = repPool[Math.floor(r() * repPool.length)];
      const mCardio = cardio[Math.floor(r() * Math.max(1, cardio.length))];
      const cardioItem = mCardio?.workModel === "erg-calories"
        ? `${Math.round(reps * 0.8)} cal ${mCardio.name}`
        : `200m ${mCardio?.name || "Run"}`;
      const metconItems = [
        `${reps} ${pickName(lightW, r, "Wall Ball")}`,
        `${reps} ${pickName(gym, r, "Pull-up")}`,
        cardioItem,
      ];
      days.push({
        id, name: DAY_NAMES[d - 1], title: `${theme} · ${ROMAN[d - 1]}`,
        isCompleted: false, hasTabs: false,
        variations: [{
          tabName: "ÚNICO",
          warmup: { title: "01. WARM-UP", scheme: "3 Rondas", items: ["Remo/bici 1'", "Movilidad de cadera", "Activación específica"] },
          strength: { title: `02. FUERZA — ${lift}`, scheme: strengthScheme(w), items: [lift] },
          metcon: { title: "03. METCON", scheme: metconFormats[(d + w + Math.floor(r() * 7)) % metconFormats.length], items: metconItems },
          accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: [`12 ${pickName(accessory, r, "Sit-up")}`] },
        }],
      });
    }
    program[`w${w}`] = { days };
  }

  const witnessMetrics = [
    "Adherencia ≥ 85% (planificado vs hecho)",
    intention === "intensificacion" ? "e1RM del levantamiento principal"
      : intention === "restauracion" ? "Frescura/ánimo al cierre del bloque"
      : "Volumen semanal sostenible",
    "Potencia media en una pieza de 10–12'",
  ];
  return { program, blockIntention: intention, witnessMetrics, lore: req.bossInspiration || "Acto sin nombre" };
}
