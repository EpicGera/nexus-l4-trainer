// Structured training data model (Firestore-native, CrossFit-specific).
// See docs/BLUEPRINT-modelo-atleta.md §3.2/§3.3/§3.5. This is the LOGGED data
// (what the athlete did) and the exercise CATALOG — separate from the program
// structure in ./workout.ts (the plan). Numbers are numbers, not unit-strings.

import type { EnergySystem, BlockTimeDomain, BlockIntention } from "./workout";

// ── CrossFit taxonomy ──────────────────────────────────────────────────────

/** Modality: Monostructural (cardio) / Gymnastics / Weightlifting. */
export type Modality = "M" | "G" | "W";
export const MODALITIES: Modality[] = ["M", "G", "W"];

export type Pattern =
  | "squat"
  | "hinge"
  | "horizontal-push"
  | "vertical-push"
  | "horizontal-pull"
  | "vertical-pull"
  | "carry"
  | "core"
  | "olympic"
  | "monostructural"
  | "gymnastics-skill";
export const PATTERNS: Pattern[] = [
  "squat", "hinge", "horizontal-push", "vertical-push", "horizontal-pull",
  "vertical-pull", "carry", "core", "olympic", "monostructural", "gymnastics-skill",
];

/** The 10 CrossFit general physical skills. */
export type GeneralSkill =
  | "cardio"
  | "stamina"
  | "strength"
  | "flexibility"
  | "power"
  | "speed"
  | "coordination"
  | "agility"
  | "balance"
  | "accuracy";
export const SKILLS: GeneralSkill[] = [
  "cardio", "stamina", "strength", "flexibility", "power",
  "speed", "coordination", "agility", "balance", "accuracy",
];

export type LoadType =
  | "external"
  | "bodyweight"
  | "bodyweight+load"
  | "machine"
  | "timed"
  | "distance";

/**
 * How the derivation engine computes external work for one rep:
 *  - load-displacement: weightKg · g · displacementM
 *  - bodyweight:        (bodyweightFraction · BWkg [+ addedLoadKg]) · g · displacementM
 *  - erg-calories:      from calories (kcal · 4184)
 *  - distance:          bodyweight transport over distance
 *  - none:              negligible external work (skill/cardio); energy via time domain
 */
export type WorkModel =
  | "load-displacement"
  | "bodyweight"
  | "erg-calories"
  | "distance"
  | "none";

// ── Exercise catalog (authored once, shared) ───────────────────────────────

/**
 * Where a resolved Exercise came from. The catalog is OPEN-WORLD: an unknown
 * movement (e.g. a future chapter's new exercise) is never rejected — it's
 * inferred from its name/context and flagged, so analysis degrades honestly
 * instead of breaking or fabricating a wrong classification.
 */
export type ExerciseSource = "catalog" | "user" | "inferred";

export interface Exercise {
  /** canonical slug, e.g. "barbell-back-squat" */
  id: string;
  /** display name */
  name: string;
  /** free-text names that map to this exercise (migration + manual entry) */
  aliases: string[];
  modality: Modality;
  pattern: Pattern;
  loadType: LoadType;
  unilateral: boolean;
  /** subset of the 10 skills this movement primarily taxes */
  skills: GeneralSkill[];
  /** dominant energy system affinity (optional explicit override; else derived
   *  by modality via energyForExercise). Lets strength/accessory sets classify
   *  for stimulus analytics even when their block carries no energySystem. */
  energy?: EnergySystem;
  workModel: WorkModel;
  /** ROM displacement per rep in meters (load-displacement / bodyweight). Approximate, tunable. */
  displacementM?: number;
  /** fraction of bodyweight actually moved (bodyweight / bodyweight+load). */
  bodyweightFraction?: number;
  /** provenance — omitted/"catalog" for bundled entries; "inferred" when guessed at runtime. */
  source?: ExerciseSource;
  /** confidence of the classification — "high" for catalog, "low" for inferred. */
  confidence?: "high" | "low";
}

// ── Logged data ─────────────────────────────────────────────────────────────

export type SetType = "warmup" | "working" | "amrap" | "failure";

export interface LoggedSet {
  id: string;
  exerciseId: string;
  /** denormalized display name (survives catalog edits / unmatched entries) */
  exerciseName: string;
  weightKg: number | null;
  isBodyweight: boolean;
  addedLoadKg: number | null;
  reps: number | null;
  distanceM: number | null;
  calories: number | null;
  timeSec: number | null;
  rpe: number | null;
  rir: number | null;
  tempo: string | null;
  setType: SetType;
  /** epoch ms */
  ts: number;
  // engine-derived (optional):
  workJ?: number;
  e1rmKg?: number;
  // ── Stimulus lineage (additive, optional) ─────────────────────────────────
  // Which prescribed block this set came from, plus a snapshot of that block's
  // intended stimulus captured AT LOG TIME (not recomputed later), so analytics
  // can compare "prescribed vs achieved" and segment performance by stimulus.
  /** block bucket/slot, e.g. "metcon" or "b2_metcon" (matches WorkoutBlockCard keySuffix) */
  blockSlot?: string;
  blockTitle?: string;
  energySystem?: EnergySystem;
  timeDomain?: BlockTimeDomain;
  intention?: BlockIntention;
  /** prescribed cap (seconds) of the source block */
  blockCapSec?: number;
}

export type MetconFormat = "amrap" | "fortime" | "emom" | "intervals" | "max";

export type Scaling = "rx" | "scaled" | "mixed";

export type MovementScalingType = "rx" | "load" | "reps" | "assist" | "sub" | "range";

export interface MovementScaling {
  type: MovementScalingType;
  detail?: string;
}

/** Protocol-aware metcon result (see BLUEPRINT §3.5.2/§3.5.3). */
export interface MetconResult {
  format: MetconFormat;
  /** fixed window known from the prescription (AMRAP/EMOM/intervals) */
  capSec?: number;
  /** RESULT for For Time / chipper: final time (when finished) */
  timeSec?: number;
  /** For Time: completed before the cap? */
  finished?: boolean;
  /** For Time NOT finished: reps completed when the cap was hit */
  repsAtCap?: number;
  /** RESULT for AMRAP / rounds */
  rounds?: number;
  reps?: number;
  /**
   * AMRAP partial round: the last movement reached in execution order. With it,
   * `reps` is the reps completed of THIS movement (a multi-movement AMRAP score
   * is "rounds + reps into the round", and this pins where in the round it was).
   */
  partialRoundMovement?: string;
  /** per-round split times (seconds) for interval pieces — Tight Grouping (cap. 43) */
  splits?: number[];
  scaling: Scaling;
  /** structured per-movement scaling, keyed by exerciseId */
  movementScaling?: Record<string, MovementScaling>;
  /** free-text fallback for dynamic mid-WOD scaling */
  scaledNotes?: string;
  /** true when scaling ≠ rx → work/power is an approximation */
  estimateApprox?: boolean;
  // Prescribed-stimulus snapshot of the source metcon block (captured at log
  // time) — lets analytics compare the intended vs the achieved stimulus.
  energySystem?: EnergySystem;
  timeDomain?: BlockTimeDomain;
}

export interface Readiness {
  /** hours of sleep */
  sleepH?: number;
  /** 1..5 */
  soreness?: number;
  /** 1..5 */
  stress?: number;
}

export interface SessionDerived {
  totalWorkJ: number;
  avgPowerW: number;
  modalityMix: Record<Modality, number>;
  /** session training load (Foster): sessionRpe · durationMin */
  loadAU: number | null;
}

export interface TrainingSession {
  id: string;
  /** real calendar date, ISO yyyy-mm-dd */
  date: string;
  /** program slot this session maps to, e.g. "w2d3" (optional) */
  dayId?: string;
  programWeek?: string;
  completed: boolean;
  durationMin: number | null;
  /** session sRPE 0..10 (Foster) */
  sessionRpe: number | null;
  readiness?: Readiness;
  metcon?: MetconResult;
  notes?: string;
  /** tabName de la variación entrenada (p.ej. "ESPECIAL"). Ausente en sesiones viejas → asumir variations[0]. */
  variationTab?: string;
  /**
   * Embedded for the in-app model (localStorage). The Firestore mapping stores
   * these under sessions/{id}/sets/{setId} — a persistence detail.
   */
  sets: LoggedSet[];
  derived?: SessionDerived;
}

export type BenchmarkType = "lift-1rm" | "named-wod";

export interface Benchmark {
  id: string;
  type: BenchmarkType;
  /** for lift-1rm */
  exerciseId?: string;
  /** for named-wod, e.g. "Fran" */
  wodName?: string;
  resultKg?: number;
  timeSec?: number;
  rounds?: number;
  reps?: number;
  rx: boolean;
  /** ISO date */
  date: string;
  sessionId?: string;
}
