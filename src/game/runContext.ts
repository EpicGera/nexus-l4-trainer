/**
 * NEXUS: EL ABISMO — run context & boss-window logic.
 *
 * Decides, from the athlete's current program position, what kind of descent
 * this is: a normal procedural dungeon crawl, or one of the TWO boss days per
 * 4-week chapter where EL SEDENTARIO can be fought.
 *
 * Boss windows (twice per chapter):
 *   1. The designated peak day  — week 3 ("PICO / BOSS FIGHT"), heaviest session.
 *   2. The deload chapter opener — first day of week 4 (deload).
 * Any other day: no boss, just the crawl. Pure & deterministic → easy to test.
 */

export const DESIGNATED_PEAK_WEEK = "w3";
export const DESIGNATED_PEAK_DAY = 4; // 0=Mon … 4=Fri (designated heavy session)
export const DELOAD_WEEK = "w4";
export const DELOAD_OPENER_DAY = 0; // Monday, first day of the deload chapter

export interface BossWindow {
  isBossDay: boolean;
  reason: "peak" | "deload" | null;
  label: string;
}

export function getBossWindow(week: string, dayIndex: number): BossWindow {
  if (week === DESIGNATED_PEAK_WEEK && dayIndex === DESIGNATED_PEAK_DAY) {
    return { isBossDay: true, reason: "peak", label: "DÍA DE PICO — EL SEDENTARIO ACECHA" };
  }
  if (week === DELOAD_WEEK && dayIndex === DELOAD_OPENER_DAY) {
    return { isBossDay: true, reason: "deload", label: "APERTURA DE DESCARGA — EL SEDENTARIO ACECHA" };
  }
  return { isBossDay: false, reason: null, label: "" };
}

/** Days until the next boss window, for the intro screen teaser. */
export function describeNextBoss(week: string, dayIndex: number): string {
  const w = getBossWindow(week, dayIndex);
  if (w.isBossDay) return w.label;
  return "El jefe solo se manifiesta el día de pico (S3) y la apertura de descarga (S4).";
}

// ── seeded RNG (mulberry32) for procedural floors ──────────────────────────
export class RNG {
  private s: number;
  constructor(seed: number) {
    this.s = (seed >>> 0) || 1;
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface RunContext {
  seed: number;
  dayId: string;
  /** program day title — regular enemies are named after it */
  dayName: string;
  isBossDay: boolean;
  bossReason: "peak" | "deload" | null;
  totalFloors: number;
}

export function buildRunContext(opts: {
  week: string;
  dayIndex: number;
  dayId: string;
  dayName: string;
}): RunContext {
  const { week, dayIndex, dayId, dayName } = opts;
  const boss = getBossWindow(week, dayIndex);
  return {
    seed: seedFromString(`${dayId}|${week}|${dayIndex}`),
    dayId,
    dayName: (dayName || "LA GRIETA").toUpperCase(),
    isBossDay: boss.isBossDay,
    bossReason: boss.reason,
    totalFloors: 3,
  };
}
