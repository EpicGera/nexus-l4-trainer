// Expansión de metcon: prescripción × resultado real → cantidades REALES por
// movimiento. "Si hice 5 rondas de un AMRAP con 15 cal Row, son 75 cal reales;
// no hay nada que estimar, hay que multiplicar." Este módulo hace esa cuenta.
//
// El wizard lo usa al sellar: cada movimiento del metcon se emite como un
// LoggedSet con reps/calorías/metros REALES, y todo el análisis aguas abajo
// (trabajo en joules, balance modal, hopper, tonelaje) lo consume sin cambios.
//
// Honestidad: si el resultado no permite derivar cantidades (For Time no
// terminado, AMRAP sin rondas, movimiento "Max Effort" sin número), se emite
// nada para ese caso — nunca se inventa.

import { MetconResult } from "../types/training";
import { getCleanExerciseName, isCueOrNote } from "./cueDetection";

export interface MetconMovementWork {
  name: string;
  reps: number | null;
  calories: number | null;
  distanceM: number | null;
  /** peso prescripto del movimiento ("(9kg)" / "@ 42,5kg"), para tonelaje real */
  weightKg: number | null;
}

type Unit = "reps" | "cal" | "m";

interface PerRound {
  name: string;
  /** cantidad por ronda; null = sin cantidad prescripta (p.ej. "Max Burpees") */
  qty: number | null;
  unit: Unit | null;
  weightKg: number | null;
}

const num = (s: string) => parseFloat(s.replace(",", "."));
const stripHtml = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();

/** "15 Cal Row" · "Row 15 cal" · "400m Run" · "20 Wall Balls (9kg)" · "12/10 Cal Bike". */
export function parsePrescribedItem(raw: string): PerRound | null {
  if (isCueOrNote(raw)) return null;
  const text = stripHtml(raw).split("·")[0];
  const name = getCleanExerciseName(raw);
  if (!name || name.length <= 1) return null;

  const w = text.match(/[@(]\s*(\d+(?:[.,]\d+)?)\s*kg/i);
  const weightKg = w ? num(w[1]) : null;

  // "12/10 cal" (hombre/mujer): se toma la primera cifra
  let m = text.match(/(\d+(?:[.,]\d+)?)(?:\s*\/\s*\d+(?:[.,]\d+)?)?\s*cal(?:s|or[ií]as?)?\b/i);
  if (m) return { name, qty: num(m[1]), unit: "cal", weightKg };
  m = text.match(/(\d+(?:[.,]\d+)?)(?:\s*\/\s*\d+(?:[.,]\d+)?)?\s*km\b/i);
  if (m) return { name, qty: num(m[1]) * 1000, unit: "m", weightKg };
  m = text.match(/(\d+(?:[.,]\d+)?)(?:\s*\/\s*\d+(?:[.,]\d+)?)?\s*(?:m|mts?|metros)\b/i);
  if (m) return { name, qty: num(m[1]), unit: "m", weightKg };
  // reps al inicio del item: "12 Burpees", "Min 2: 8 Deadlifts", "10/8 Pull-ups"
  m = text.match(/^(?:Min\s+\d+:\s*)?(\d+)(?:\s*\/\s*\d+)?\s+\D/i);
  if (m) return { name, qty: parseInt(m[1], 10), unit: "reps", weightKg };
  return { name, qty: null, unit: null, weightKg };
}

/** Rondas prescriptas del esquema: "5 RONDAS", "EVERY 1:30 x 5", EMOM rotando. */
export function prescribedRounds(scheme: string, movementCount: number): number | null {
  const U = (scheme || "").toUpperCase();
  let m = U.match(/(\d+)\s*(?:RONDAS?|ROUNDS?|RDS)\b/);
  if (m) return parseInt(m[1], 10);
  m = U.match(/EVERY\s*\d+(?::\d{2})?\s*(?:MIN)?\s*X\s*(\d+)/);
  if (m) return parseInt(m[1], 10);
  // EMOM N rotando entre los movimientos: cada uno toca floor(N / cantidad) veces
  m = U.match(/EMOM\s*(\d+)/);
  if (m && movementCount > 0) return Math.floor(parseInt(m[1], 10) / movementCount);
  return null;
}

/** Suma de una escalera "21-15-9" (≥3 tramos para no confundir con rangos). */
export function ladderSum(scheme: string): number | null {
  const m = (scheme || "").match(/(\d+(?:\s*-\s*\d+){2,})/);
  if (!m) return null;
  return m[1].split("-").reduce((s, n) => s + parseInt(n.trim(), 10), 0);
}

function emit(p: PerRound, qty: number): MetconMovementWork {
  return {
    name: p.name,
    reps: p.unit === "reps" ? Math.round(qty) : null,
    calories: p.unit === "cal" ? Math.round(qty) : null,
    distanceM: p.unit === "m" ? Math.round(qty) : null,
    weightKg: p.weightKg,
  };
}

/**
 * La cuenta completa: prescripción por movimiento × rondas realmente
 * completadas (con ronda parcial del AMRAP atribuida a su movimiento).
 */
export function expandMetconWork(
  rawItems: string[],
  scheme: string,
  result: MetconResult,
): MetconMovementWork[] {
  const parsed = rawItems
    .map(parsePrescribedItem)
    .filter((p): p is PerRound => p !== null);
  if (!parsed.length) return [];

  const ladder = ladderSum(scheme);
  const out: MetconMovementWork[] = [];

  if (result.format === "amrap") {
    const base = result.rounds;
    if (base == null || base < 0) return [];
    const partialIdx = result.partialRoundMovement
      ? parsed.findIndex((p) => p.name === result.partialRoundMovement)
      : -1;
    parsed.forEach((p, i) => {
      if (p.qty == null || !p.unit) return; // sin cantidad prescripta → honesto: nada
      let total = p.qty * base;
      if (partialIdx >= 0) {
        if (i < partialIdx) total += p.qty; // movimientos ya completos de la ronda parcial
        if (i === partialIdx && result.reps) total += result.reps; // parcial, en SU unidad
      }
      if (total > 0) out.push(emit(p, total));
    });
    return out;
  }

  if (result.format === "fortime" || result.format === "intervals" || result.format === "emom") {
    // For Time sin terminar: no se puede atribuir por movimiento → nada (honesto)
    if (result.format === "fortime" && result.finished === false) return [];
    const rounds = prescribedRounds(scheme, parsed.length) ?? 1;
    parsed.forEach((p) => {
      // escalera 21-15-9: los items no llevan número; el total es la suma
      const perRound = p.qty ?? (ladder != null && (!p.unit || p.unit === "reps") ? ladder : null);
      const unit = p.unit ?? (ladder != null ? "reps" : null);
      if (perRound == null || !unit) return;
      const total = (p.qty != null ? perRound * rounds : perRound); // la escalera ya es total
      if (total > 0) out.push(emit({ ...p, unit }, total));
    });
    return out;
  }

  return []; // "max" y formatos sin cuenta derivable
}
