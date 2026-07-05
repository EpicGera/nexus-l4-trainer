// Recaps del pizarrón: cómo le fue al atleta en la SEMANA (domingos) y en el
// MES completo (domingo de la semana 4). Versión resumida de RPE & Metas para
// verse desde el pizarrón. Puro y testeable: deriva de las sesiones
// estructuradas (tonelaje ya = carga externa, coherente con el resto).

import { TrainingSession, Modality } from "../types/training";
import { parseDayId } from "./storageKeys";
import {
  sessionTotals, sessionLoadAU, estimate1RM, patternVolume, exerciseForSet,
} from "./trainingEngine";
import { getBodyweightKg } from "./profileMetrics";

export interface MovementLine { name: string; tonnageKg: number; reps: number }
export interface MarkLine { name: string; e1rmKg: number }

export interface WeekRecap {
  week: string;
  weekNumber: number;
  sessions: number;
  tonnageKg: number;
  workKJ: number;
  avgRpe: number | null;
  modalBalance: Record<Modality, number>;
  topMovements: MovementLine[];
  marks: MarkLine[];
  headline: string;
}

export interface MonthRecap {
  weeks: { week: string; weekNumber: number; tonnageKg: number; avgRpe: number | null; sessions: number }[];
  totalSessions: number;
  totalTonnageKg: number;
  totalWorkKJ: number;
  avgRpe: number | null;
  modalBalance: Record<Modality, number>;
  marks: MarkLine[];
  deloadOk: boolean | null;
  headline: string;
}

const round = (n: number) => Math.round(n);
const kj = (j: number) => Math.round(j / 1000);

/** Sesiones cuyo dayId cae en `week` (ej "w3"), o todas si week es null. */
function sessionsInWeek(sessions: TrainingSession[], week: string | null): TrainingSession[] {
  return sessions.filter((s) => {
    const p = s.dayId ? parseDayId(s.dayId) : null;
    return week === null ? !!p : p && `w${p.week}` === week;
  });
}

function avgRpeOf(sessions: TrainingSession[]): number | null {
  const vals: number[] = [];
  for (const s of sessions) {
    if (typeof s.sessionRpe === "number" && s.sessionRpe > 0) vals.push(s.sessionRpe);
    else {
      const setRpes = s.sets.map((x) => x.rpe).filter((r): r is number => typeof r === "number" && r > 0);
      if (setRpes.length) vals.push(setRpes.reduce((a, b) => a + b, 0) / setRpes.length);
    }
  }
  return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
}

function modalBalanceOf(sessions: TrainingSession[], bw: number): Record<Modality, number> {
  const w: Record<Modality, number> = { M: 0, G: 0, W: 0 };
  for (const s of sessions) {
    const t = sessionTotals(s, bw);
    (Object.keys(w) as Modality[]).forEach((m) => (w[m] += t.modalityWorkJ[m]));
  }
  const total = w.M + w.G + w.W;
  return {
    M: total > 0 ? Math.round((w.M / total) * 100) : 0,
    G: total > 0 ? Math.round((w.G / total) * 100) : 0,
    W: total > 0 ? Math.round((w.W / total) * 100) : 0,
  };
}

/** Mejores e1RM del período (por movimiento), top N. */
function marksOf(sessions: TrainingSession[], n = 4): MarkLine[] {
  const best: Record<string, number> = {};
  for (const s of sessions) {
    for (const set of s.sets) {
      const e = estimate1RM(set.weightKg, set.reps);
      if (e != null) best[set.exerciseName] = Math.max(best[set.exerciseName] || 0, e);
    }
  }
  return Object.entries(best)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, e1rmKg]) => ({ name, e1rmKg: round(e1rmKg) }));
}

function totalsOf(sessions: TrainingSession[], bw: number) {
  let tonnage = 0, work = 0;
  for (const s of sessions) {
    const t = sessionTotals(s, bw);
    tonnage += t.totalVolumeKg;
    work += t.totalWorkJ;
  }
  return { tonnageKg: round(tonnage), workKJ: kj(work) };
}

function topMovementsOf(sessions: TrainingSession[], bw: number, n = 4): MovementLine[] {
  const agg: Record<string, { tonnageKg: number; reps: number }> = {};
  for (const s of sessions) {
    for (const set of s.sets) {
      const ex = exerciseForSet(set);
      const vol = set.reps ? (ex.workModel === "bodyweight" ? (set.addedLoadKg ?? 0) : (set.weightKg ?? 0)) * set.reps : 0;
      const a = (agg[set.exerciseName] ||= { tonnageKg: 0, reps: 0 });
      a.tonnageKg += vol;
      a.reps += set.reps ?? 0;
    }
  }
  return Object.entries(agg)
    .sort((a, b) => b[1].tonnageKg - a[1].tonnageKg || b[1].reps - a[1].reps)
    .slice(0, n)
    .map(([name, v]) => ({ name, tonnageKg: round(v.tonnageKg), reps: v.reps }));
}

export function computeWeekRecap(
  sessions: TrainingSession[],
  week: string,
  bw: number = getBodyweightKg(),
): WeekRecap {
  const wk = sessionsInWeek(sessions, week);
  const { tonnageKg, workKJ } = totalsOf(wk, bw);
  const avgRpe = avgRpeOf(wk);
  const weekNumber = parseInt(week.replace("w", ""), 10) || 0;

  let headline: string;
  if (wk.length === 0) headline = "Semana sin registros. El pizarrón está esperando.";
  else if (avgRpe != null && avgRpe >= 9) headline = `${wk.length} sesión(es) a fondo — RPE ${avgRpe}. Semana dura; cuidá la recuperación.`;
  else if (wk.length >= 4) headline = `${wk.length} sesiones completadas. Semana sólida y consistente.`;
  else headline = `${wk.length} sesión(es) registrada(s) esta semana.`;

  return {
    week, weekNumber, sessions: wk.length, tonnageKg, workKJ, avgRpe,
    modalBalance: modalBalanceOf(wk, bw), topMovements: topMovementsOf(wk, bw),
    marks: marksOf(wk), headline,
  };
}

export function computeMonthRecap(
  sessions: TrainingSession[],
  bw: number = getBodyweightKg(),
): MonthRecap {
  const weeks = ["w1", "w2", "w3", "w4"].map((week) => {
    const wk = sessionsInWeek(sessions, week);
    return {
      week, weekNumber: parseInt(week.replace("w", ""), 10),
      tonnageKg: totalsOf(wk, bw).tonnageKg, avgRpe: avgRpeOf(wk), sessions: wk.length,
    };
  });
  const all = sessionsInWeek(sessions, null).filter((s) => {
    const p = parseDayId(s.dayId || "");
    return p && p.week >= 1 && p.week <= 4;
  });
  const { tonnageKg, workKJ } = totalsOf(all, bw);

  // deload check: w4 debería estar por debajo de las semanas de carga (w1-3)
  const loading = weeks.slice(0, 3).filter((w) => w.tonnageKg > 0);
  const loadAvg = loading.length ? loading.reduce((s, w) => s + w.tonnageKg, 0) / loading.length : 0;
  const w4 = weeks[3].tonnageKg;
  const deloadOk = w4 > 0 && loadAvg > 0 ? w4 <= loadAvg * 0.75 : null;

  const trained = weeks.filter((w) => w.sessions > 0).length;
  const headline =
    all.length === 0 ? "Mes sin registros aún."
    : `${all.length} sesiones en ${trained} semana(s). ${deloadOk === false ? "La descarga quedó alta: la semana 4 debería aflojar más." : deloadOk ? "Descarga bien dosificada." : "Seguí registrando para leer la descarga."}`;

  return {
    weeks, totalSessions: all.length, totalTonnageKg: tonnageKg, totalWorkKJ: workKJ,
    avgRpe: avgRpeOf(all), modalBalance: modalBalanceOf(all, bw), marks: marksOf(all, 5),
    deloadOk, headline,
  };
}
