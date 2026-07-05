// Display metadata for week block intention + Lifestyle Gear (Fase B).
// Parsing/inference lives in sheetImport.ts; this is the pure label/color map.

import { BlockIntention, EnergySystem, BlockTimeDomain } from "../types/workout";
import type { Exercise } from "../types/training";

/**
 * Dominant energy system for a single exercise. Honors an explicit `ex.energy`
 * tag; otherwise derives a safe default by modality/work model so strength &
 * accessory sets still classify in the stimulus analytics:
 *  - Weightlifting / heavy load → phosphagen (short maximal efforts)
 *  - Monostructural (erg/distance) → oxidative (sustained)
 *  - Gymnastics / everything else → mixed
 */
export function energyForExercise(ex: Exercise): EnergySystem {
  if (ex.energy) return ex.energy;
  if (ex.modality === "M" || ex.workModel === "erg-calories" || ex.workModel === "distance")
    return "oxidative";
  if (ex.modality === "W" || ex.workModel === "load-displacement") return "phosphagen";
  return "mixed";
}

// PRVN monochrome: rampa de grises por fase; el rojo señal marca el pico de carga.
export const INTENTION_META: Record<BlockIntention, { label: string; short: string; color: string }> = {
  acumulacion: { label: "ACUMULACIÓN", short: "ACUM", color: "#A3A3A3" },
  intensificacion: { label: "INTENSIFICACIÓN", short: "INTENS", color: "#DC2626" },
  realizacion: { label: "REALIZACIÓN · PEAK", short: "PEAK", color: "#FFFFFF" },
  restauracion: { label: "RESTAURACIÓN · DELOAD", short: "DELOAD", color: "#525252" },
};

export const GEAR_LABEL: Record<number, string> = {
  1: "GEAR 1 · DESCANSO",
  2: "GEAR 2 · RECONSTRUCCIÓN",
  3: "GEAR 3 · BASE",
  4: "GEAR 4 · PRE-TEMPORADA",
  5: "GEAR 5 · ÉLITE",
};

// PRVN monochrome: rampa de gris por intensidad (fosfágeno = más brillante);
// rojo señal para el glucolítico (el "ardor" es la señal).
export const ENERGY_META: Record<EnergySystem, { label: string; color: string; hint: string }> = {
  phosphagen: { label: "FOSFÁGENO", color: "#FFFFFF", hint: "Sistema fosfágeno: esfuerzos máximos de hasta ~10s (levantamientos pesados, sprints). Potencia pura, recuperaciones largas." },
  glycolytic: { label: "GLUCOLÍTICO", color: "#DC2626", hint: "Sistema glucolítico: esfuerzos intensos de ~30s a 2-3 min. El 'ardor' de los metcons cortos y feroces. Costo de recuperación alto." },
  oxidative: { label: "OXIDATIVO", color: "#737373", hint: "Sistema oxidativo (aeróbico): la base que sostiene todo. Esfuerzos largos sostenibles a ritmo conversacional." },
  mixed: { label: "MIXTO", color: "#A3A3A3", hint: "Estímulo mixto: combina varios sistemas energéticos. Típico de metcons medios (10-20 min)." },
};

export const TIMEDOMAIN_META: Record<BlockTimeDomain, { label: string; hint: string }> = {
  sprint: { label: "SPRINT", hint: "Dominio sprint: menos de ~2 min. Intensidad máxima, fosfágeno/glucolítico." },
  short: { label: "CORTO", hint: "Dominio corto: ~2-8 min. Glucolítico dominante — feroz y breve." },
  medium: { label: "MEDIO", hint: "Dominio medio: ~8-20 min. El corazón del CrossFit. Estímulo mixto con ritmo declarado." },
  long: { label: "LARGO", hint: "Dominio largo: 20 min+. Aeróbico/oxidativo. Sostenible de principio a fin." },
};

// Back-compat: plain label map (used where only the label is needed).
export const TIMEDOMAIN_LABEL: Record<BlockTimeDomain, string> = {
  sprint: "SPRINT",
  short: "CORTO",
  medium: "MEDIO",
  long: "LARGO",
};
