// ADN de estilo: ejemplos REALES y destilados de cómo programan las escuelas
// que Nexus L4 referencia (HWPO / PRVN / MAYHEM / HAEDO). Se inyecta un
// subconjunto RELEVANTE en el prompt del generador para que aprenda la VOZ y la
// ESTRUCTURA de cada una y combine lo mejor según lo que la periodización pide
// — nunca para copiar literal ni para que todo salga de una sola escuela.
//
// Cómo crece: sumá exemplars destilados de nuevas transcripciones (ver
// docs/estilos-referencia/). Condensados, no el texto crudo: el prompt debe
// quedar liviano. Cada exemplar captura un patrón, no un WOD específico.

import { BrandKey } from "../lib/constants";

export type Facet = "structure" | "strength" | "accessory" | "metcon" | "cardio" | "skill" | "scaling";

export interface StyleExemplar {
  brand: BrandKey;
  facet: Facet;
  /** patrón/insight en una línea (para selección + prompt) */
  pattern: string;
  /** ejemplo condensado real (así prescribe esta escuela ese facet) */
  example: string;
}

// ── HWPO (Mat Fraser) — sembrado desde transcripciones Strong 2.0 / Foundations / Flagship ──
const HWPO: StyleExemplar[] = [
  {
    brand: "HWPO", facet: "structure",
    pattern: "Día = warm-up → fuerza primaria → movimiento secundario → accesorios (que DRIVEN el progreso) → metcon y cardio OPCIONALES escritos para no comprometer la fuerza.",
    example: "WARMUP · PRIMARY STRENGTH · SECONDARY/SKILL · ACCESSORY · METCON (opcional) · CARDIO/BONUS (opcional). Fases de 4 semanas, semana 4 = deload. Working Max = 90% del 1RM real.",
  },
  {
    brand: "HWPO", facet: "strength",
    pattern: "Fuerza por acumulación de volumen + tiempo bajo tensión; reps moderadas-altas con RPE; builds técnicos por sensación en vez de % rígido; descanso explícito.",
    example: "Back Squat 5x10 @ 66% WM // RPE 6, Rest 1-2'. (Opción técnica: 10x5.) + Back Rack Reverse Lunge 4x8/8 @ RPE 7, eccéntrico controlado / concéntrico explosivo. · Deadlift: 'construí en 10-12' a un set técnico pesado de 10 // RPE 8' + 3x5 al mismo peso.",
  },
  {
    brand: "HWPO", facet: "accessory",
    pattern: "Los accesorios NO son relleno: manejan el progreso. TUT máximo, tempos explícitos, sets al fallo, buscar el pump; reps con caída set a set.",
    example: "Dumbbell RDL 3 sets: :30 max reps @ RPE 8, tempo @2020 (2s baja, 2s sube), sin 'gamear' con reps rápidas. + KB Seal Row 4x8-12 cerca del fallo. + Tricep Ext / Hammer Curl 3 sets @ RPE 9 'hacelo lo más duro que puedas, buscá el pump'.",
  },
  {
    brand: "HWPO", facet: "metcon",
    pattern: "Metcon frecuentemente OPCIONAL y dosificado para no interferir con la fuerza; grind pace sostenible; carries y burpees; pesos livianos para ir unbroken.",
    example: "For Time (cap 11'): 40 Burpee, 200m Farmers Carry 2x35lb, 20 Burpee, 100m Farmers Carry. 'Los burpees hacen pesado el carry; peso liviano para intentar unbroken'. · AMRAP 12: 12/9 cal Fan Bike, 50' Sandbag Carry, 150' Farmers Carry — pace de grind, RPE 7 en la bici.",
  },
  {
    brand: "HWPO", facet: "cardio",
    pattern: "Cardio opcional, escrito para no afectar la progresión de fuerza; base aeróbica Zona 2 en máquina + intervalos medidos; termina con un all-out.",
    example: "Zona 2: 40-60' Bike Erg @ 80-90 RPM, 'debería sentirse vergonzosamente lento'. · Intervalos: escalera Ski/Row/Bike 3-3-2-2-1... (16' total), arrancá Z2 y cerrá con un minuto all-out. · 10x :30 Row hard / 1:00 rest (ratio 1:2 trabajo-descanso).",
  },
  {
    brand: "HWPO", facet: "skill",
    pattern: "Complejos olímpicos y gimnasia técnica en fresco; rangos de peso guiados por RPE alto (justo bajo el max effort); tempos y resets prescritos.",
    example: "Squat Clean + Above-Knee Hang Squat Clean + Split Jerk 3x(1+1+2) @ RPE 9-9.5, Rest 2'. · Tempo Box Pike HSPU 6 sets 3-5 reps, tempo :03 abajo/:02 pausa. · EMOM 12: min 1-6 :40 Fan Bike, min 7-12 1-4 Bar Muscle-Up.",
  },
  {
    brand: "HWPO", facet: "scaling",
    pattern: "Escalado que PRESERVA el estímulo con subs de ratio explícito por movimiento (no 'hacé menos'); cada skill difícil tiene su regresión con equivalencia de carga/volumen relativa. Ratios completos: Apéndice G de la enciclopedia (única fuente de verdad — no dupliques números acá).",
    example: "Patrón: cadena de 2-3 regresiones por movimiento difícil, de más a menos exigente (ej. GHD Sit-Up → Abmat con lastre → Abmat sin lastre con más reps → Dual Leg Raise). Si un movimiento no aplica al atleta (lesión, skill no dominado del perfil), prescribí su sub del Apéndice G manteniendo el dominio y la carga relativa — nunca lo saltees sin reemplazo.",
  },
];

// PRVN / MAYHEM / HAEDO: sembrar a medida que llegan transcripciones de cada escuela.
const PRVN: StyleExemplar[] = [];
const MAYHEM: StyleExemplar[] = [];
const HAEDO: StyleExemplar[] = [];

export const STYLE_EXEMPLARS: StyleExemplar[] = [...HWPO, ...PRVN, ...MAYHEM, ...HAEDO];

/** Escuelas que ya tienen ejemplos cargados (para el texto del prompt). */
export function loadedBrands(pool: StyleExemplar[] = STYLE_EXEMPLARS): BrandKey[] {
  return Array.from(new Set(pool.map((e) => e.brand)));
}

/**
 * Selecciona hasta `max` exemplars variando FACET (para cubrir estructura +
 * distintos bloques) y repartiendo entre las escuelas disponibles, así el
 * generador ve varios estilos y combina — no uno solo. `preferFacets` prioriza
 * los facets que el capítulo va a construir. Determinístico dado el pool.
 */
export function selectExemplars(opts: {
  preferFacets?: Facet[];
  max?: number;
  pool?: StyleExemplar[];
} = {}): StyleExemplar[] {
  const pool = opts.pool ?? STYLE_EXEMPLARS;
  const max = opts.max ?? 5;
  if (!pool.length) return [];

  const order: Facet[] = [
    ...(opts.preferFacets ?? []),
    "structure", "strength", "accessory", "metcon", "cardio", "skill", "scaling",
  ];
  const seenFacet = new Set<Facet>();
  const brandCount: Record<string, number> = {};
  const picked: StyleExemplar[] = [];

  // 1ª pasada: un exemplar por facet (en orden de preferencia), repartiendo escuelas
  for (const f of order) {
    if (picked.length >= max || seenFacet.has(f)) continue;
    const candidates = pool.filter((e) => e.facet === f);
    if (!candidates.length) continue;
    candidates.sort((a, b) => (brandCount[a.brand] ?? 0) - (brandCount[b.brand] ?? 0));
    const chosen = candidates[0];
    picked.push(chosen);
    seenFacet.add(f);
    brandCount[chosen.brand] = (brandCount[chosen.brand] ?? 0) + 1;
  }
  // relleno si sobra cupo
  for (const e of pool) {
    if (picked.length >= max) break;
    if (!picked.includes(e)) picked.push(e);
  }
  return picked.slice(0, max);
}

/** Bloque de prompt con los exemplars seleccionados. "" si no hay ninguno. */
export function exemplarsPromptBlock(exemplars: StyleExemplar[]): string {
  if (!exemplars.length) return "";
  const brands = Array.from(new Set(exemplars.map((e) => e.brand))).join(", ");
  const lines = exemplars.map((e) => `• [${e.brand} · ${e.facet}] ${e.pattern}\n   Ej: ${e.example}`);
  return (
    `EJEMPLOS DE ESTILO (ADN de escuelas: ${brands}). Aprendé la VOZ y la ESTRUCTURA de cómo prescriben ` +
    `y COMBINÁ lo mejor de cada una según lo que ESTE capítulo necesita (la evaluación y el objetivo del ` +
    `atleta mandan). Si un día o bloque pide el estilo de una escuela, usalo; si pide mezclar, mezclá. ` +
    `NO copies literal ni armes todo con una sola escuela:\n` +
    lines.join("\n")
  );
}
