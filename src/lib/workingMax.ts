// Working Max (HWPO, enciclopedia cap. 17): los porcentajes de fuerza se calculan
// sobre el Working Max = 90% del 1RM real, no sobre el 1RM. Este módulo guarda los
// 1RM del atleta (syncable: clave `nexus_`), y resuelve un scheme con `% WM`
// (ej. "4x6 @ 65-70% WM") + un ejercicio a un rango de carga en kg para mostrar.

import { resolveOrInfer } from "../data/exerciseCatalog";
import { loadSessions } from "./sessionStore";
import { estimate1RM } from "./trainingEngine";

const ONE_RM_KEY = "nexus_athlete_1rm";

/** Levantamientos principales ofrecidos en el editor de PERFIL & BIO. */
export const MAIN_LIFTS: { id: string; name: string }[] = [
  { id: "back-squat", name: "Back Squat" },
  { id: "front-squat", name: "Front Squat" },
  { id: "overhead-squat", name: "Overhead Squat" },
  { id: "deadlift", name: "Deadlift" },
  { id: "strict-press", name: "Strict Press" },
  { id: "push-press", name: "Push Press" },
  { id: "bench-press", name: "Bench Press" },
  { id: "clean", name: "Clean" },
  { id: "snatch", name: "Snatch" },
  { id: "clean-and-jerk", name: "Clean & Jerk" },
];

export const WM_FACTOR = 0.9;

/** The barbell lifts where the stored value is a true 1RM (K applies). For any
 *  other movement the stored value IS the working load, used directly (no K). */
export const MAIN_LIFT_IDS = new Set(MAIN_LIFTS.map((l) => l.id));
export const isMainLift = (id: string) => MAIN_LIFT_IDS.has(id);

const ADJUST_KEY = "nexus_wm_adjust";

/**
 * Working Max Dinámico coefficient K (enciclopedia cap. 30–31 / Apéndice B):
 * WMD = 1RM × K, calibrated per athlete (0.85 fast-fatiguing / 0.90 balanced /
 * 0.93–0.95 high volume tolerance). Read from the athlete profile; defaults to
 * the classic 0.9 when unset or out of a sane range.
 */
export function getKCoefficient(): number {
  try {
    const raw = localStorage.getItem("nexus_athlete_state");
    const k = raw ? Number(JSON.parse(raw)?.kCoefficient) : NaN;
    return Number.isFinite(k) && k >= 0.7 && k <= 1.0 ? k : WM_FACTOR;
  } catch {
    return WM_FACTOR;
  }
}

/** Per-lift autoregulation factor (default 1.0). The closed-loop lever: nudging
 *  this recalculates every future `% WM` load via resolveWmRange, no JSON edit. */
export function getWmAdjustFactor(exerciseId: string): number {
  try {
    const raw = localStorage.getItem(ADJUST_KEY);
    const f = raw ? Number(JSON.parse(raw)?.[exerciseId]) : NaN;
    return Number.isFinite(f) && f > 0.5 && f < 1.5 ? f : 1;
  } catch {
    return 1;
  }
}

/** Read all per-lift autoregulation factors. */
export function getWmAdjusts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(ADJUST_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

/** Set (or reset to 1.0 → remove) a lift's autoregulation factor, clamped. */
export function setWmAdjustFactor(exerciseId: string, factor: number): void {
  const all = getWmAdjusts();
  const f = Math.max(0.8, Math.min(1.2, factor));
  if (!Number.isFinite(f) || Math.abs(f - 1) < 0.001) delete all[exerciseId];
  else all[exerciseId] = Math.round(f * 1000) / 1000;
  try {
    localStorage.setItem(ADJUST_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("nexus_logs_updated"));
  } catch {
    /* storage restricted — ignore */
  }
}

export function getOneRepMaxes(): Record<string, number> {
  try {
    const raw = localStorage.getItem(ONE_RM_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

/** Set (or clear when null/≤0) a lift's 1RM in kg. Notifies the board to re-render. */
export function setOneRepMax(exerciseId: string, kg: number | null): void {
  const all = getOneRepMaxes();
  if (kg == null || !Number.isFinite(kg) || kg <= 0) delete all[exerciseId];
  else all[exerciseId] = kg;
  try {
    localStorage.setItem(ONE_RM_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("nexus_logs_updated"));
  } catch {
    /* storage restricted — ignore */
  }
}

/**
 * Working Max for a lift = 1RM × K (per-athlete WMD coefficient) × autoreg factor.
 * Null if no 1RM stored. K defaults to 0.9; the autoreg factor defaults to 1.0,
 * so existing behavior is unchanged until either is calibrated.
 */
export function getWorkingMax(exerciseId: string): number | null {
  const orm = getOneRepMaxes()[exerciseId];
  if (!(orm && orm > 0)) return null;
  // K only nuances true barbell 1RMs; for accessories the stored value already
  // IS the working load, so it's used directly (× autoregulation factor).
  const k = isMainLift(exerciseId) ? getKCoefficient() : 1;
  return orm * k * getWmAdjustFactor(exerciseId);
}

/**
 * Parse a `% WM` token from a block scheme: "65-70% WM", "@ 80% WM", "70 % wm".
 * Requires the literal "WM" so plain percentages (1RM-based or notes) are ignored.
 */
export function parseWmPct(scheme: string): { low: number; high: number } | null {
  if (!scheme || !/wm/i.test(scheme)) return null;
  const m = scheme.match(/(\d{1,3})\s*(?:-\s*(\d{1,3}))?\s*%\s*WM/i);
  if (!m) return null;
  const low = parseInt(m[1], 10);
  const high = m[2] ? parseInt(m[2], 10) : low;
  if (low <= 0 || low > 100 || high <= 0 || high > 100) return null;
  return { low: Math.min(low, high), high: Math.max(low, high) };
}

const roundKg = (kg: number) => Math.round(kg * 2) / 2; // nearest 0.5 kg

/**
 * Resolve a strength block scheme + an exercise name into a Working-Max kg range.
 * Returns null when the scheme has no `% WM`, the exercise has no stored 1RM, or
 * the name can't be resolved to a catalog lift.
 */
export function resolveWmRange(
  scheme: string,
  exerciseName: string,
): { lowKg: number; highKg: number; pctLow: number; pctHigh: number } | null {
  const pct = parseWmPct(scheme);
  if (!pct) return null;
  const id = resolveOrInfer(exerciseName).id;
  const wm = getWorkingMax(id);
  if (wm == null) return null;
  return {
    lowKg: roundKg((wm * pct.low) / 100),
    highKg: roundKg((wm * pct.high) / 100),
    pctLow: pct.low,
    pctHigh: pct.high,
  };
}

/**
 * Best estimated 1RM per exercise id from logged structured sessions (Epley over
 * every weighted set, max wins). Powers the "autofill from logs" action so the
 * athlete doesn't have to type every number. Empty when there are no logs.
 */
export function estimateOneRepMaxesFromLogs(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of loadSessions()) {
    for (const set of s.sets) {
      if (!set.exerciseId) continue;
      const e = estimate1RM(set.weightKg, set.reps);
      if (e != null) out[set.exerciseId] = Math.max(out[set.exerciseId] || 0, Math.round(e));
    }
  }
  return out;
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** Compact label e.g. "≈ 58.5–63 kg" (range) or "≈ 63 kg" (single). */
export function wmRangeLabel(r: { lowKg: number; highKg: number }): string {
  return r.lowKg === r.highKg ? `≈ ${fmt(r.lowKg)} kg` : `≈ ${fmt(r.lowKg)}–${fmt(r.highKg)} kg`;
}
