// What inputs a logging station shows. The catalog Exercise gives a default
// (load/work model), but the PRESCRIPTION TEXT is authoritative when it carries
// an explicit unit: the same movement can be programmed for calories, meters,
// external load or reps ("15 Cal Row" vs "500m Row" vs "Bent-over Row 40kg"),
// and inferred (uncatalogued) movements get the default wrong. Deciding from the
// text is what stops the wizard asking kg on a cal row or reps on a 400m run.

import { Exercise } from "../types/training";

export type InputMode =
  | "loaded"
  | "bodyweight"
  | "loadedBodyweight"
  | "cardioCal"
  | "cardioDist"
  | "timed";

const norm = (s: string) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, " ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const RE_CAL = /\b(?:calorias?|cals?)\b/;
// Locomotion words are ALWAYS distance (a run is never a loaded movement).
const RE_RUN = /\b(?:run|carrera|correr|trote|sprint)\b/;
// A bare distance number can be a loaded carry ("Farmer Carry 40m"), so it only
// switches to cardioDist when the catalog default isn't a loaded movement.
const RE_METERS = /\b\d+\s*(?:m|mts|metros|km)\b/;
const RE_LOAD = /\bkg\b|@\s*\d+\s*%|\bbarra\b|mancuern|kettlebell|\bkb\b|barbell|dumbbell|sandbag|pesa\s+rusa/;
const RE_TIMED = /\b(?:plancha|plank|hold|isom\w*|l-?sit|wall\s*sit|hollow\s*hold)\b/;

/**
 * Reps the prescription text asks for, so the wizard can prefill them:
 *   "4x6"→6, "5x3"→3, "12 reps"→12, "5 repeticiones"→5, "10 a 12 reps"→10.
 * Returns the working reps (the M in NxM, or the lower bound of a range).
 */
export function prescribedReps(text: string): number | null {
  const t = norm(text);
  // Explicit reps win — most reliable, and avoids reading a load/time spec as
  // reps ("2x15kg - 8 reps" → 8, not 15).
  const range = t.match(/(\d+)\s*a\s*(\d+)\s*(?:reps|repeticiones)/); // "10 a 12 reps"
  if (range) return Number(range[1]);
  const r = t.match(/(\d+)\s*(?:reps|repeticiones)/);
  if (r) return Number(r[1]);
  // NxM sets×reps → reps, but NOT when M is a load/time unit ("2x15kg" = DBs,
  // "3x20 segundos" = timed hold) — those aren't rep counts.
  const nx = t.match(/(\d+)\s*x\s*(\d+)(?!\d)(?!\s*(?:kg|%|seg|segundos|cm))/);
  if (nx) return Number(nx[2]);
  return null;
}

/** Per-set seconds for timed work: "3x20 segundos"→20, "30 seg hold"→30. */
export function prescribedSeconds(text: string): number | null {
  const t = norm(text);
  const nx = t.match(/\d+\s*x\s*(\d+)\s*(?:seg|segundos)\b/); // "3x20 segundos"
  if (nx) return Number(nx[1]);
  const s = t.match(/(\d+)\s*(?:seg|segundos)\b/);
  if (s) return Number(s[1]);
  return null;
}

/**
 * How many sets the prescription asks for, so the wizard can pre-register the
 * prescribed work by default:
 *   "4x6"→4, "5 x 3"→5, "3 series"→3, "4 sets"→4, "5 rondas"→5.
 * Returns the N (the sets count); null when the text carries no set count.
 */
export function prescribedSets(text: string): number | null {
  const t = norm(text);
  // NxM → N (sets), but not a load multiplier ("2x15kg" = two DBs, not 2 sets).
  // Seconds are allowed ("3x20 segundos" = 3 sets of a 20s hold).
  const nx = t.match(/(\d+)\s*x\s*\d+(?!\d)(?!\s*(?:kg|%|cm))/);
  if (nx) return Number(nx[1]);
  const s = t.match(/(\d+)\s*(?:series?|sets?|rondas?|rounds?)/);
  if (s) return Number(s[1]);
  return null;
}

/** Explicit external load in kg in the text: "con 90 kg"→90, "(50kg)"→50. */
export function prescribedKg(text: string): number | null {
  const m = norm(text).match(/(\d+(?:[.,]\d+)?)\s*kg/);
  return m ? Number(m[1].replace(",", ".")) : null;
}

/** Intensity percentage(s) of 1RM in a scheme: "@ 75-80%"→{lo:75,hi:80}. */
export function prescribedPct(scheme: string): { lo: number; hi: number } | null {
  const m = norm(scheme).match(/(\d{1,3})\s*(?:-\s*(\d{1,3}))?\s*%/);
  if (!m) return null;
  const lo = Number(m[1]);
  const hi = m[2] ? Number(m[2]) : lo;
  if (lo <= 0 || lo > 100 || hi <= 0 || hi > 100) return null;
  return { lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
}

/** Input mode from the catalog Exercise alone (its load / work model). */
export function inputModeFor(ex: Exercise): InputMode {
  if (ex.workModel === "erg-calories") return "cardioCal";
  if (ex.workModel === "distance") return "cardioDist";
  if (ex.loadType === "external") return "loaded";
  if (ex.loadType === "bodyweight+load") return "loadedBodyweight";
  if (ex.loadType === "bodyweight") return "bodyweight";
  return "timed"; // timed / machine / "none" skill movements (DU, plank…)
}

/**
 * What to ask for a station. Explicit cardio units in the text win outright
 * (catalog often mis-defaults these). An explicit external-load word upgrades a
 * bodyweight/timed/inferred default to "loaded", but never downgrades a catalog
 * `loadedBodyweight` (weighted pull-up) or a cardio movement. Otherwise the
 * catalog default stands.
 */
export function detectInputMode(itemText: string, ex: Exercise): InputMode {
  const t = norm(itemText);
  const base = inputModeFor(ex);

  if (RE_CAL.test(t)) return "cardioCal";

  if (RE_RUN.test(t)) return "cardioDist"; // locomotion — always distance

  if (RE_METERS.test(t)) {
    // Meters on a loaded carry (farmer carry 40m) still logs load — keep it.
    return base === "loaded" || base === "loadedBodyweight" ? base : "cardioDist";
  }

  if (RE_LOAD.test(t)) {
    if (base === "loadedBodyweight" || base === "cardioCal" || base === "cardioDist") return base;
    return "loaded";
  }

  if (RE_TIMED.test(t)) {
    return base === "loaded" || base === "loadedBodyweight" ? base : "timed";
  }

  return base;
}
