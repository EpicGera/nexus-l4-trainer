// Mapa muscular del día: de los ejercicios de una variación → carga relativa por
// grupo muscular (0..1), para pintar un maniquí en el dashboard. El patrón de
// movimiento (Pattern del catálogo) es el puente — más robusto que hacer match
// por keywords del nombre.

import { DayVariation } from "../types/workout";
import { Pattern } from "../types/training";
import { resolveOrInfer } from "../data/exerciseCatalog";
import { loggableBlockItems } from "./blockGrouping";
import type { HeatmapPart } from "../components/analytics/BodyHeatmap";

export type MuscleGroup =
  | "quads" | "hamstrings" | "glutes" | "calves"
  | "lower_back" | "upper_back" | "lats"
  | "chest" | "shoulders" | "biceps" | "triceps" | "forearms" | "core";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "quads", "hamstrings", "glutes", "calves", "lower_back", "upper_back",
  "lats", "chest", "shoulders", "biceps", "triceps", "forearms", "core",
];

// Cuánto carga cada patrón a cada grupo (pesos 0..1, agonistas altos, sinergistas
// bajos). No pretende ser EMG exacto; es una heurística para el mapa de impacto.
export const PATTERN_MUSCLES: Record<Pattern, Partial<Record<MuscleGroup, number>>> = {
  squat: { quads: 1, glutes: 0.7, hamstrings: 0.4, lower_back: 0.3, core: 0.3 },
  hinge: { hamstrings: 1, glutes: 0.9, lower_back: 0.7, upper_back: 0.3, forearms: 0.3 },
  "horizontal-push": { chest: 1, triceps: 0.7, shoulders: 0.5, core: 0.2 },
  "vertical-push": { shoulders: 1, triceps: 0.7, upper_back: 0.3, core: 0.3 },
  "horizontal-pull": { upper_back: 1, lats: 0.6, biceps: 0.6, forearms: 0.4 },
  "vertical-pull": { lats: 1, biceps: 0.7, upper_back: 0.6, forearms: 0.5 },
  carry: { forearms: 1, core: 0.8, upper_back: 0.5, glutes: 0.3 },
  core: { core: 1 },
  olympic: { quads: 0.7, glutes: 0.7, hamstrings: 0.5, upper_back: 0.6, shoulders: 0.6, lower_back: 0.4, core: 0.4 },
  monostructural: { quads: 0.5, hamstrings: 0.4, calves: 0.5, glutes: 0.3, core: 0.2 },
  "gymnastics-skill": { core: 0.7, shoulders: 0.6, lats: 0.5, chest: 0.4, triceps: 0.4 },
};

/**
 * Carga por grupo muscular de una variación, normalizada a 0..1 (el grupo más
 * trabajado = 1). Todos los items loggables de todos los bloques cuentan.
 */
export function muscleLoadForVariation(v: DayVariation): Record<MuscleGroup, number> {
  const acc = Object.fromEntries(MUSCLE_GROUPS.map((m) => [m, 0])) as Record<MuscleGroup, number>;

  const blocks = v.blocks?.length
    ? v.blocks
    : [v.warmup, v.strength, v.metcon, v.accessories].filter(Boolean);

  for (const b of blocks) {
    const items = loggableBlockItems((b.items || []).map((x) => String(x ?? "")).filter((x) => x.trim()));
    for (const st of items) {
      const pattern = resolveOrInfer(st.name || st.text).pattern as Pattern;
      const weights = PATTERN_MUSCLES[pattern];
      if (!weights) continue;
      for (const [m, w] of Object.entries(weights)) {
        acc[m as MuscleGroup] += w as number;
      }
    }
  }

  const max = Math.max(0, ...MUSCLE_GROUPS.map((m) => acc[m]));
  if (max === 0) return acc;
  for (const m of MUSCLE_GROUPS) acc[m] = acc[m] / max;
  return acc;
}

// Colapsa nuestros 13 grupos a las 8 regiones del maniquí bodychart_heatmap
// (neck/chest/shoulder/arm/abs/leg/butt/back). Copia el criterio de WODFORGE:
// se queda con el MÁX de los grupos que caen en cada región (no suma). `neck`
// nunca se enciende porque ningún Pattern nuestro lo carga.
const GROUP_TO_PART: Record<MuscleGroup, HeatmapPart> = {
  quads: "leg", hamstrings: "leg", calves: "leg",
  glutes: "butt",
  core: "abs",
  lower_back: "back", upper_back: "back", lats: "back",
  chest: "chest",
  shoulders: "shoulder",
  biceps: "arm", triceps: "arm", forearms: "arm",
};

export function toHeatmapParts(
  load: Record<MuscleGroup, number>,
): Partial<Record<HeatmapPart, number>> {
  const out: Partial<Record<HeatmapPart, number>> = {};
  for (const m of MUSCLE_GROUPS) {
    const part = GROUP_TO_PART[m];
    out[part] = Math.max(out[part] ?? 0, load[m]);
  }
  return out;
}
