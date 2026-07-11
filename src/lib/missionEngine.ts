// Motor de misiones DETERMINISTA (sin IA, sin red). Reemplaza al Coach Chat:
//  · deriveDayGoal  → el ★ OBJ. DIARIO derivado del JSON del programa
//  · generateMission → la misión secundaria, del contenido real del día
//  · validateMission → validador contra la sesión LOGUEADA (sessionStore)
// La variación ESPECIAL llega como `activeVariation`, así que todo funciona
// igual para el día especial que suplanta.

import type { DayVariation, WeekMeta, BlockIntention } from "../types/workout";
import type { TrainingSession } from "../types/training";
import { INTENTION_META } from "./blockMeta";
import { loggableBlockItems } from "./blockGrouping";
import { resolveOrInfer } from "../data/exerciseCatalog";
import { WEEK_RPE_TARGET } from "./constants";

// ── util ─────────────────────────────────────────────────────────────────────

/** Hash estable de un string → entero no negativo (djb2-ish), para elegir sin RNG. */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (s.charCodeAt(i) + ((h << 5) - h)) | 0;
  return Math.abs(h);
}

function blocksOf(v: DayVariation) {
  return v.blocks?.length ? v.blocks : [v.warmup, v.strength, v.metcon, v.accessories].filter(Boolean);
}

const firstOf = (v: DayVariation, bucket: "strength" | "metcon") =>
  v.blocks?.find((b) => b.bucket === bucket) ?? v[bucket];

const cleanScheme = (s?: string) => (s || "").replace(/<[^>]*>/g, "").trim();

// ── 1. OBJ. DIARIO derivado del JSON ─────────────────────────────────────────

/**
 * Objetivo del día leído del programa: intención de la semana + bloque de fuerza
 * (título + scheme) + formato del metcon. Cambia con el día seleccionado y con la
 * variación ESPECIAL. Todo en MAYÚSCULAS (estilo pizarrón).
 */
export function deriveDayGoal(variation?: DayVariation, weekMeta?: WeekMeta): string {
  if (!variation) return "";
  const parts: string[] = [];

  if (weekMeta?.intention) parts.push(INTENTION_META[weekMeta.intention].label);

  const strength = firstOf(variation, "strength");
  if (strength) {
    // quita el prefijo ordinal del bloque ("02. FUERZA…" → "FUERZA…")
    const title = (strength.title || "").replace(/<[^>]*>/g, "").replace(/^\s*\d+\.\s*/, "").trim();
    const scheme = cleanScheme(strength.scheme);
    const label = [title, scheme].filter(Boolean).join(" ").trim();
    if (label) parts.push(label);
  }

  const metcon = firstOf(variation, "metcon");
  const mScheme = cleanScheme(metcon?.scheme);
  if (mScheme) parts.push(`METCON ${mScheme}`);

  return parts.join(" · ").toUpperCase().slice(0, 160);
}

// ── 2. Misión secundaria determinista ────────────────────────────────────────

interface MissionRule {
  /** ¿aplica según los patrones presentes? */
  test: (patterns: Set<string>) => boolean;
  /** una o más misiones candidatas (se elige por hash del dayId) */
  quests: string[];
}

// Reglas por patrón de movimiento (orden = prioridad de fuerza→gimnasia→cardio).
const MISSION_RULES: MissionRule[] = [
  {
    test: (p) => p.has("squat"),
    quests: [
      "SENTADILLA CON ROM COMPLETO: ROMPER EL PARALELO CONTROLADO EN CADA SERIE",
      "TENSIÓN CONSTANTE EN CUÁDRICEPS: SIN REBOTE, PAUSA DE 1s EN EL HOYO",
    ],
  },
  {
    test: (p) => p.has("hinge"),
    quests: [
      "CADENA POSTERIOR ANCLADA: LUMBAR NEUTRO Y CORE BLINDADO EN CADA TIRÓN",
      "BISAGRA LIMPIA: LLEVAR LA CADERA ATRÁS, NUNCA REDONDEAR LA ESPALDA",
    ],
  },
  {
    test: (p) => p.has("olympic"),
    quests: [
      "EXTENSIÓN DE CADERA PURA: NO ARREBATAR LA BARRA EN EL SEGUNDO TIRÓN",
      "RECEPCIÓN AGRESIVA: METERSE BAJO LA BARRA, CODOS RÁPIDOS",
    ],
  },
  {
    test: (p) => p.has("vertical-pull") || p.has("horizontal-pull"),
    quests: [
      "TRACCIÓN DESDE DORSALES: INICIAR CON ESCÁPULAS, EXCLUIR EL BÍCEPS COMPENSATORIO",
      "GIMNASIA HIGIÉNICA: RANGO COMPLETO, BARBILLA SOBRE LA BARRA SIN KIPPING SUCIO",
    ],
  },
  {
    test: (p) => p.has("vertical-push") || p.has("horizontal-push"),
    quests: [
      "CHASIS ALINEADO: GLÚTEOS Y CORE ANCLADOS ANTES DE EMPUJAR ARRIBA",
      "PRESS ESTRICTO: SIN ARQUEO LUMBAR, LA BARRA VIAJA EN LÍNEA RECTA",
    ],
  },
  {
    test: (p) => p.has("monostructural"),
    quests: [
      "RITMO CARDIOVASCULAR SOSTENIBLE: RESPIRACIÓN NASAL, RITMO CONVERSACIONAL",
      "CADENCIA CONSTANTE EN LA MÁQUINA: SPLIT PAREJO, SIN PICOS QUE FUNDAN EL MOTOR",
    ],
  },
  {
    test: (p) => p.has("core"),
    quests: ["CORE BAJO TENSIÓN: NO CONTENER LA RESPIRACIÓN, MANTENER LA COSTILLA ABAJO"],
  },
];

const RESTAURACION_MISSIONS = [
  "SNC RESET: CERO CARGA AXIAL, FOCO EN RESPIRACIÓN NASAL Y MOVILIDAD LENTA",
  "DELOAD INTELIGENTE: MITAD DE LA CARGA, VELOCIDAD DE BARRA IMPECABLE",
];

const FALLBACK_MISSIONS = [
  "MANTENER LA VELOCIDAD DE TRABAJO EN EL DIAPASÓN DEL METCON",
  "CALIDAD DE MOVIMIENTO POR ENCIMA DE LA CARGA EN CADA SERIE",
  "RESPIRACIÓN RÍTMICA Y POSTURA IMPECABLE DE PRINCIPIO A FIN",
];

/** Patrones de movimiento de los ítems loggables de un conjunto de bloques. */
function patternsOf(blocks: { items?: string[] }[]): Set<string> {
  const patterns = new Set<string>();
  for (const b of blocks) {
    const items = loggableBlockItems((b.items || []).map((x) => String(x ?? "")).filter((x) => x.trim()));
    for (const st of items) {
      const p = resolveOrInfer(st.name || st.text).pattern;
      if (p) patterns.add(p);
    }
  }
  return patterns;
}

/**
 * Misión secundaria determinista del día. Prioridad: deload (restauración) manda;
 * si no, el patrón del BLOQUE DE FUERZA (el titular del día) sobre el resto; se
 * elige una misión estable por hash del dayId. Sin IA, sin red.
 */
export function generateMission(dayId: string, variation?: DayVariation, weekMeta?: WeekMeta): string {
  const pick = (pool: string[]) => pool[hashStr(dayId) % pool.length];

  if (weekMeta?.intention === "restauracion") return pick(RESTAURACION_MISSIONS);
  if (!variation) return pick(FALLBACK_MISSIONS);

  const strength = firstOf(variation, "strength");
  const strengthPatterns = strength ? patternsOf([strength]) : new Set<string>();
  const allPatterns = patternsOf(blocksOf(variation));

  const matching = (pats: Set<string>) => MISSION_RULES.filter((r) => r.test(pats)).flatMap((r) => r.quests);
  const byStrength = matching(strengthPatterns);
  const pool = byStrength.length ? byStrength : matching(allPatterns);
  return pick(pool.length ? pool : FALLBACK_MISSIONS);
}

// ── 3. Validador determinista ────────────────────────────────────────────────

export interface MissionCheck {
  label: string;
  pass: boolean;
  /** un check crítico bloquea la validación si falla */
  critical?: boolean;
}

export interface MissionValidation {
  ok: boolean;
  checks: MissionCheck[];
}

const weekOf = (dayId: string) => (dayId.match(/^w\d+/)?.[0] ?? "");

/**
 * Valida la misión del día contra la sesión LOGUEADA (no contra prosa). Checks
 * deterministas; el crítico (sesión sellada) gobierna `ok`.
 */
export function validateMission(
  dayId: string,
  session: TrainingSession | null,
  variation?: DayVariation,
  band?: { min: number; max: number },
): MissionValidation {
  const checks: MissionCheck[] = [];

  const sealed = !!session?.completed;
  checks.push({ label: "Sesión registrada y sellada (ANOTAR WOD)", pass: sealed, critical: true });

  const workingSets = (session?.sets || []).filter(
    (s) => s.setType === "working" && (s.weightKg != null || s.reps != null),
  );
  const hasStrength = !!firstOf(variation ?? ({} as DayVariation), "strength");
  if (hasStrength) {
    checks.push({ label: "Series de fuerza cargadas", pass: workingSets.length > 0 });
  }

  const rpeBand = band ?? WEEK_RPE_TARGET[weekOf(dayId)] ?? { min: 6, max: 8 };
  const rpe = session?.sessionRpe;
  checks.push({
    label: `RPE de sesión en banda (${rpeBand.min}–${rpeBand.max})`,
    pass: rpe != null && rpe >= rpeBand.min - 0.5 && rpe <= rpeBand.max + 0.5,
  });

  const metconBlock = firstOf(variation ?? ({} as DayVariation), "metcon");
  const hasMetcon = !!(metconBlock && (metconBlock.items || []).length > 0);
  if (hasMetcon) {
    const m = session?.metcon;
    const hasResult = !!m && (m.timeSec != null || m.rounds != null || m.reps != null || m.finished != null);
    checks.push({ label: "Metcon con resultado", pass: hasResult });
  }

  // ok = el crítico pasa Y hay sustancia registrada (series o metcon)
  const substance = workingSets.length > 0 || !!session?.metcon;
  const ok = sealed && substance;
  return { ok, checks };
}
