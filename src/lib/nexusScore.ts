// Puntaje Nexus — measures REAL performance vs the PRESCRIPTION for a week, from
// data already captured (RPE per set vs the week's target band, metcon vs its
// timecap, and PR candidates). Pure + testable; feeds the autoregulation engine.

import { loadSessions } from "./sessionStore";
import { estimate1RM } from "./trainingEngine";
import { getOneRepMaxes } from "./workingMax";
import { WEEK_RPE_TARGET } from "./constants";
import type { TrainingSession } from "../types/training";

export type LiftPerf = "bajo" | "banda" | "sobre"; // below / in / above target band
export type MetconPerf = "arraso" | "completo" | "dnf";

export interface LiftScore {
  exerciseId: string;
  name: string;
  avgRpe: number;
  sets: number;
  targetMid: number;
  rpeDelta: number;
  perf: LiftPerf;
}

export interface MetconScore {
  dayId: string;
  format: string;
  perf: MetconPerf;
  detail: string;
}

export interface PrCandidate {
  exerciseId: string;
  name: string;
  e1rm: number;
  current: number | null;
}

export interface NexusScore {
  week: string;
  sessions: number;
  hasData: boolean;
  /** 0–100: 50 = en la dosis, >50 = por encima (margen), <50 = por debajo */
  score: number;
  status: string;
  /** highest working-set RPE logged in the week — a safety signal for the veto */
  maxRpe: number;
  lifts: LiftScore[];
  metcons: MetconScore[];
  prs: PrCandidate[];
}

function sessionsForWeek(week: string): TrainingSession[] {
  const w = week.toLowerCase();
  return loadSessions().filter(
    (s) => (s.dayId && s.dayId.toLowerCase().startsWith(w + "d")) || (s.programWeek && s.programWeek.toLowerCase() === w),
  );
}

/** Per-lift RPE performance vs the week's prescribed band. */
function scoreLifts(sessions: TrainingSession[], targetMid: number): LiftScore[] {
  const acc: Record<string, { name: string; rpeSum: number; rpeN: number }> = {};
  for (const s of sessions) {
    for (const set of s.sets || []) {
      if (set.setType !== "working" || set.rpe == null || !set.exerciseId) continue;
      // Only loaded lifts (strength) carry a Working-Max prescription.
      if (set.weightKg == null && set.addedLoadKg == null) continue;
      const a = (acc[set.exerciseId] ||= { name: set.exerciseName || set.exerciseId, rpeSum: 0, rpeN: 0 });
      a.rpeSum += set.rpe;
      a.rpeN += 1;
    }
  }
  return Object.entries(acc).map(([exerciseId, a]) => {
    const avgRpe = Math.round((a.rpeSum / a.rpeN) * 10) / 10;
    const rpeDelta = Math.round((avgRpe - targetMid) * 10) / 10;
    const perf: LiftPerf = rpeDelta <= -1 ? "bajo" : rpeDelta >= 1 ? "sobre" : "banda";
    return { exerciseId, name: a.name, avgRpe, sets: a.rpeN, targetMid, rpeDelta, perf };
  });
}

/** Per-metcon performance vs its timecap. */
function scoreMetcons(sessions: TrainingSession[]): MetconScore[] {
  const out: MetconScore[] = [];
  for (const s of sessions) {
    const m = s.metcon;
    if (!m) continue;
    const dayId = s.dayId || s.date;
    if (m.format === "fortime") {
      if (m.finished && m.timeSec != null && m.capSec) {
        const ratio = m.timeSec / m.capSec;
        if (ratio < 0.85) out.push({ dayId, format: m.format, perf: "arraso", detail: `${Math.round(ratio * 100)}% del cap` });
        else out.push({ dayId, format: m.format, perf: "completo", detail: `${Math.round(ratio * 100)}% del cap` });
      } else if (m.finished) {
        out.push({ dayId, format: m.format, perf: "completo", detail: "terminado" });
      } else {
        out.push({ dayId, format: m.format, perf: "dnf", detail: m.repsAtCap != null ? `${m.repsAtCap} reps al cap` : "no terminó" });
      }
    } else {
      // AMRAP / EMOM / intervals: completion without a hard fail reads as completed.
      out.push({ dayId, format: m.format, perf: "completo", detail: m.rounds != null ? `${m.rounds} rondas` : "registrado" });
    }
  }
  return out;
}

/** New 1RM candidates: a logged set implies >2% over the stored max. */
function findPrs(sessions: TrainingSession[]): PrCandidate[] {
  const maxes = getOneRepMaxes();
  const best: Record<string, { name: string; e1rm: number }> = {};
  for (const s of sessions) {
    for (const set of s.sets || []) {
      if (!set.exerciseId) continue;
      const e = estimate1RM(set.weightKg, set.reps);
      if (e == null) continue;
      const b = best[set.exerciseId];
      if (!b || e > b.e1rm) best[set.exerciseId] = { name: set.exerciseName || set.exerciseId, e1rm: Math.round(e) };
    }
  }
  const out: PrCandidate[] = [];
  for (const [exerciseId, b] of Object.entries(best)) {
    const current = maxes[exerciseId] ?? null;
    if (current == null || b.e1rm > current * 1.02) out.push({ exerciseId, name: b.name, e1rm: b.e1rm, current });
  }
  return out;
}

export function puntajeNexus(week: string): NexusScore {
  const target = WEEK_RPE_TARGET[week] || { min: 6, max: 8 };
  const targetMid = Math.round(((target.min + target.max) / 2) * 10) / 10;
  const sessions = sessionsForWeek(week);

  const lifts = scoreLifts(sessions, targetMid);
  const metcons = scoreMetcons(sessions);
  const prs = findPrs(sessions);
  let maxRpe = 0;
  for (const s of sessions) for (const set of s.sets || []) {
    if (set.setType === "working" && set.rpe != null) maxRpe = Math.max(maxRpe, set.rpe);
  }

  // Composite 0–100: each lift/metcon votes −1 (struggling) / 0 / +1 (easy/beat),
  // mapped around 50. Empty → 50 (neutral, "sin datos").
  const votes: number[] = [
    ...lifts.map((l) => (l.perf === "bajo" ? 1 : l.perf === "sobre" ? -1 : 0)),
    ...metcons.map((m) => (m.perf === "arraso" ? 1 : m.perf === "dnf" ? -1 : 0)),
  ];
  const avgVote = votes.length ? votes.reduce((a, b) => a + b, 0) / votes.length : 0;
  const score = Math.max(0, Math.min(100, Math.round(50 + avgVote * 25)));
  const status =
    !votes.length ? "Sin datos de la semana"
    : score >= 65 ? "Por encima de la dosis — margen para subir"
    : score < 40 ? "Por debajo de la dosis — considerar bajar"
    : "En la dosis prescrita";

  return {
    week,
    sessions: sessions.length,
    hasData: sessions.length > 0,
    score,
    status,
    maxRpe,
    lifts,
    metcons,
    prs,
  };
}
