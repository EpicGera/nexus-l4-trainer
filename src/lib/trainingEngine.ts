// Derivation engine — pure, deterministic CrossFit-specific math over the
// structured training data (types/training.ts) + the exercise catalog. Turns
// the few things the athlete logs (weight, reps, RPE, score, sRPE) into work,
// power, e1RM, training load/ACWR, energy-system & modal classification, skills
// exposure and pattern volume. See docs/BLUEPRINT-modelo-atleta.md §3.4.
//
// Honesty: movements with workModel "none" (and inferred ones) contribute 0
// work — we never fabricate joules. Volume/RPE/load/e1RM still work for them.

import {
  Exercise,
  LoggedSet,
  Modality,
  Pattern,
  GeneralSkill,
  TrainingSession,
  MetconResult,
  PATTERNS,
  SKILLS,
} from "../types/training";
import { getExercise, resolveOrInfer } from "../data/exerciseCatalog";

export const GRAVITY = 9.80665;
export const KCAL_TO_J = 4184;
/** Mechanical external-work approximation for bodyweight transport (J per kg per m). Tunable. */
export const TRANSPORT_J_PER_KG_M = 1.0;
/** Fallback bodyweight (kg) when the athlete hasn't logged one. */
export const DEFAULT_BODYWEIGHT_KG = 75;

/** Resolve the catalog Exercise for a logged set (open-world: never null). */
export function exerciseForSet(set: LoggedSet): Exercise {
  return getExercise(set.exerciseId) ?? resolveOrInfer(set.exerciseName);
}

/** Estimated 1RM (Epley). Null when inputs are missing or reps out of valid range. */
export function estimate1RM(weightKg: number | null, reps: number | null): number | null {
  if (!weightKg || weightKg <= 0 || !reps || reps <= 0) return null;
  if (reps === 1) return weightKg;
  if (reps > 15) return null; // formula loses validity past ~15 reps
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/** Effective load moved per rep (external kg, or bodyweight fraction + added load). */
export function effectiveLoadKg(set: LoggedSet, ex: Exercise, bw: number): number {
  if (ex.workModel === "load-displacement") return set.weightKg ?? 0;
  if (ex.workModel === "bodyweight") {
    return (ex.bodyweightFraction ?? 1) * bw + (set.addedLoadKg ?? 0);
  }
  return 0;
}

/** External mechanical work of one set, in joules. */
export function setWorkJ(set: LoggedSet, ex: Exercise, bw = DEFAULT_BODYWEIGHT_KG): number {
  const reps = set.reps ?? 0;
  switch (ex.workModel) {
    case "load-displacement":
    case "bodyweight": {
      const load = effectiveLoadKg(set, ex, bw);
      const disp = ex.displacementM ?? 0;
      return load * GRAVITY * disp * reps;
    }
    case "erg-calories":
      return (set.calories ?? 0) * KCAL_TO_J;
    case "distance":
      return (set.distanceM ?? 0) * bw * TRANSPORT_J_PER_KG_M;
    default:
      return 0; // "none" — skill/cardio with negligible external work
  }
}

/** Tonnage of one set (kg). Bodyweight movements use effective bodyweight load. */
export function setVolumeKg(set: LoggedSet, ex: Exercise, bw = DEFAULT_BODYWEIGHT_KG): number {
  const reps = set.reps ?? 0;
  if (ex.workModel === "bodyweight") return effectiveLoadKg(set, ex, bw) * reps;
  return (set.weightKg ?? 0) * reps;
}

/** Seconds of working time for power: metcon result first, else session duration. */
export function workingSeconds(session: TrainingSession): number | null {
  const m = session.metcon;
  if (m) {
    if (typeof m.timeSec === "number" && m.timeSec > 0) return m.timeSec;
    if (typeof m.capSec === "number" && m.capSec > 0) return m.capSec;
  }
  if (typeof session.durationMin === "number" && session.durationMin > 0) {
    return session.durationMin * 60;
  }
  return null;
}

export interface SessionTotals {
  totalWorkJ: number;
  totalVolumeKg: number;
  totalSets: number;
  /** average power output (W) over working time, or null if time unknown / no work */
  avgPowerW: number | null;
  /** external work split by modality */
  modalityWorkJ: Record<Modality, number>;
  /** sets whose classification was inferred (open-world), surfaced as "sin clasificar" */
  uncategorizedSets: number;
}

export function sessionTotals(
  session: TrainingSession,
  bw = DEFAULT_BODYWEIGHT_KG,
): SessionTotals {
  let totalWorkJ = 0;
  let totalVolumeKg = 0;
  let uncategorizedSets = 0;
  const modalityWorkJ: Record<Modality, number> = { M: 0, G: 0, W: 0 };

  for (const set of session.sets) {
    const ex = exerciseForSet(set);
    const w = setWorkJ(set, ex, bw);
    totalWorkJ += w;
    totalVolumeKg += setVolumeKg(set, ex, bw);
    modalityWorkJ[ex.modality] += w;
    if (ex.source === "inferred") uncategorizedSets++;
  }

  const sec = workingSeconds(session);
  const avgPowerW = sec && totalWorkJ > 0 ? Math.round(totalWorkJ / sec) : null;

  return {
    totalWorkJ: Math.round(totalWorkJ),
    totalVolumeKg: Math.round(totalVolumeKg),
    totalSets: session.sets.length,
    avgPowerW,
    modalityWorkJ,
    uncategorizedSets,
  };
}

/** Session training load (Foster sRPE method): sessionRpe · durationMin. */
export function sessionLoadAU(session: TrainingSession): number | null {
  if (session.sessionRpe == null || session.durationMin == null) return null;
  return Math.round(session.sessionRpe * session.durationMin);
}

export type TimeDomain = "sprint" | "short" | "medium" | "long";

/** Time-domain bucket for the modal map (sprint <2', short 2–8', medium 8–20', long >20'). */
export function timeDomain(sec: number): TimeDomain {
  if (sec < 120) return "sprint";
  if (sec < 480) return "short";
  if (sec < 1200) return "medium";
  return "long";
}

export type EnergySystem = "phosphagen" | "glycolytic" | "oxidative";

/** Dominant energy system by effort duration (phosphagen ≤10s, glycolytic ≤2', oxidative >2'). */
export function classifyEnergySystem(sec: number): EnergySystem {
  if (sec <= 20) return "phosphagen";
  if (sec <= 120) return "glycolytic";
  return "oxidative";
}

/**
 * Acute:chronic workload ratio. dailyLoads keyed by ISO date (yyyy-mm-dd).
 * acute = mean daily load over last 7 days, chronic = mean over last 28 days.
 * Sweet spot 0.8–1.3; >1.5 elevated injury risk. Null when no chronic data.
 */
export function acwr(dailyLoads: Record<string, number>, refDateISO: string): number | null {
  const ref = new Date(refDateISO + "T00:00:00Z").getTime();
  const dayMs = 86400000;
  let acute = 0;
  let chronic = 0;
  for (const [d, load] of Object.entries(dailyLoads)) {
    const t = new Date(d + "T00:00:00Z").getTime();
    const ageDays = (ref - t) / dayMs;
    if (ageDays < 0) continue;
    if (ageDays < 7) acute += load;
    if (ageDays < 28) chronic += load;
  }
  const acuteAvg = acute / 7;
  const chronicAvg = chronic / 28;
  if (chronicAvg <= 0) return null;
  return Math.round((acuteAvg / chronicAvg) * 100) / 100;
}

export interface MonotonyStrain {
  weeklyLoad: number;
  monotony: number | null;
  strain: number | null;
}

/** Foster monotony (mean/SD of daily load) and strain (weeklyLoad · monotony). */
export function monotonyStrain(dailyLoads: number[]): MonotonyStrain {
  const weeklyLoad = dailyLoads.reduce((a, b) => a + b, 0);
  const n = dailyLoads.length;
  if (n === 0) return { weeklyLoad: 0, monotony: null, strain: null };
  const mean = weeklyLoad / n;
  const variance = dailyLoads.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance);
  if (sd === 0) {
    // Identical nonzero loads across ≥2 days is MAXIMUM monotony (Apéndice
    // K.5) — the highest-risk case, not missing data. mean/sd → ∞, so cap it.
    // ponytail: fixed 5.0 ceiling (Foster flags ~2.0 as high); a single day
    // or an all-zero week stays null (insufficient data, not monotone).
    if (n >= 2 && mean > 0) {
      return { weeklyLoad, monotony: 5, strain: Math.round(weeklyLoad * 5) };
    }
    return { weeklyLoad, monotony: null, strain: null };
  }
  const monotony = Math.round((mean / sd) * 100) / 100;
  return { weeklyLoad, monotony, strain: Math.round(weeklyLoad * monotony) };
}

export interface PatternVolume {
  sets: number;
  reps: number;
  tonnageKg: number;
}

/** Sets / reps / tonnage grouped by movement pattern across sessions. */
export function patternVolume(
  sessions: TrainingSession[],
  bw = DEFAULT_BODYWEIGHT_KG,
): Record<Pattern, PatternVolume> {
  const out = {} as Record<Pattern, PatternVolume>;
  for (const p of PATTERNS) out[p] = { sets: 0, reps: 0, tonnageKg: 0 };
  for (const session of sessions) {
    for (const set of session.sets) {
      const ex = exerciseForSet(set);
      const pv = out[ex.pattern];
      pv.sets += 1;
      pv.reps += set.reps ?? 0;
      pv.tonnageKg += setVolumeKg(set, ex, bw);
    }
  }
  for (const p of PATTERNS) out[p].tonnageKg = Math.round(out[p].tonnageKg);
  return out;
}

/** Exposure-based skills radar: each skill scored 0..100 by how often it was trained. */
export function skillsRadar(sessions: TrainingSession[]): Record<GeneralSkill, number> {
  const counts = {} as Record<GeneralSkill, number>;
  for (const s of SKILLS) counts[s] = 0;
  for (const session of sessions) {
    for (const set of session.sets) {
      const ex = exerciseForSet(set);
      for (const sk of ex.skills) counts[sk] += 1;
    }
  }
  const max = Math.max(1, ...SKILLS.map((s) => counts[s]));
  const out = {} as Record<GeneralSkill, number>;
  for (const s of SKILLS) out[s] = Math.round((counts[s] / max) * 100);
  return out;
}

/** Dominant modality of a metcon session, weighted by external work. */
export function dominantModality(session: TrainingSession, bw = DEFAULT_BODYWEIGHT_KG): Modality | null {
  const { modalityWorkJ } = sessionTotals(session, bw);
  const entries = Object.entries(modalityWorkJ) as [Modality, number][];
  const top = entries.sort((a, b) => b[1] - a[1])[0];
  return top && top[1] > 0 ? top[0] : null;
}

/**
 * Modal map coverage: work (J) bucketed by modality × time-domain. Reveals the
 * athlete's holes (empty/low cells) — the Hopper. Only sessions with a timed
 * metcon contribute (the time domain comes from the effort duration).
 */
export function modalMapCoverage(
  sessions: TrainingSession[],
  bw = DEFAULT_BODYWEIGHT_KG,
): Record<Modality, Record<TimeDomain, number>> {
  const empty = (): Record<TimeDomain, number> => ({ sprint: 0, short: 0, medium: 0, long: 0 });
  const out: Record<Modality, Record<TimeDomain, number>> = { M: empty(), G: empty(), W: empty() };
  for (const session of sessions) {
    const sec = workingSeconds(session);
    if (!sec) continue;
    const mod = dominantModality(session, bw);
    if (!mod) continue;
    const { totalWorkJ } = sessionTotals(session, bw);
    out[mod][timeDomain(sec)] += totalWorkJ;
  }
  return out;
}
