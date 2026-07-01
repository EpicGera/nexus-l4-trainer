export interface WarmupBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface StrengthBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface MetconBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface AccessoriesBlock {
  title: string;
  scheme: string;
  items: string[];
}

/**
 * A generic, ordered program block. Unlike the four fixed blocks below, a
 * program can declare ANY number of blocks in ANY order with arbitrary names
 * (e.g. "HALTEROFILIA TÉCNICA", "GRUNT WORK", "FINISHER"). `key` preserves the
 * source identity (e.g. "b2_skill"); `bucket` maps it onto one of the four
 * legacy lanes for backward-compatible consumers (board render, export, wizard).
 */
export type BlockBucket = "warmup" | "strength" | "metcon" | "accessories";

/** Dominant energy system of a conditioning piece (enciclopedia cap. 30). */
export type EnergySystem = "phosphagen" | "glycolytic" | "oxidative" | "mixed";
/** Time-domain bucket (same values as trainingEngine.TimeDomain). */
export type BlockTimeDomain = "sprint" | "short" | "medium" | "long";

export interface ProgramBlock {
  key: string;
  title: string;
  scheme: string;
  items: string[];
  bucket: BlockBucket;
  /** Time Cap in seconds (a fatigue shield, enciclopedia cap. 43). Derived from the scheme. */
  capSec?: number;
  /** Derived time-domain of a metcon block (from its declared duration/cap). */
  timeDomain?: BlockTimeDomain;
  /** Derived dominant energy system of a metcon block. */
  energySystem?: EnergySystem;
  /**
   * Inspiration brand key (HAEDO | MAYHEM | HWPO | PRVN), classified once by AI
   * at import/generate (Fase 3), else inferred by the keyword heuristic. When
   * present the UI uses it directly instead of re-guessing per render.
   */
  inspiration?: string;
}

export interface DayVariation {
  tabName: string;
  warmup: WarmupBlock;
  strength: StrengthBlock;
  metcon: MetconBlock;
  accessories: AccessoriesBlock;
  /**
   * Canonical ordered block list. Present for programs that use the flexible
   * multi-block format; the four fixed fields above are derived from it for
   * backward compatibility. Legacy programs may omit this.
   */
  blocks?: ProgramBlock[];
}

export interface DayWorkout {
  id: string; // e.g., "w1d1"
  name: string; // "LUNES"
  title: string; // "La Guarida del Mal"
  isCompleted: boolean;
  hasTabs?: boolean;
  variations: DayVariation[];
}

/**
 * Declared (or inferred) intention of a training block/week — HWPO/CF-L4: every
 * block names its dominant adaptation before it starts (enciclopedia cap. 17–18).
 * Same values as chapterCreator's BlockIntention so they interoperate.
 */
export type BlockIntention =
  | "acumulacion"
  | "intensificacion"
  | "realizacion"
  | "restauracion";

/** Per-week metadata: block intention + Lifestyle Gear (1–5), both optional. */
export interface WeekMeta {
  intention?: BlockIntention;
  /** Lifestyle Gear 1–5 (enciclopedia cap. 60): caps intensity/volume for the week. */
  gear?: number;
  /** true when the intention was derived from content, not declared in the JSON. */
  inferred?: boolean;
}

export interface WeekPlan {
  days: DayWorkout[];
  meta?: WeekMeta;
}

export interface Database {
  [key: string]: WeekPlan;
}

export interface AthleteState {
  identity: string;
  level: string;
  restriction: string;
  condition: string;
  equipment: {
    grebas: string;
    amuleto: string;
    filtro: string;
  };
  /** Working Max Dinámico coefficient K (WMD = 1RM × K). Default 0.90. */
  kCoefficient?: number;
}
