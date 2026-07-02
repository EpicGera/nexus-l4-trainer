// Canonical athlete stats document — the single source the future videogame
// (and any other consumer) reads. Computed client-side from localStorage and
// pushed to Firestore at users/{uid}/profile/stats whenever training data
// changes. Treat it as user-owned, client-authoritative data.

import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { cleanExerciseLabel } from "./historyUtils";
import { parseLoggedNumber, parseLoggedWeightKg } from "./logParse";
import { loadSessions } from "./sessionStore";
import { getBodyweightKg } from "./profileMetrics";
import {
  sessionTotals, sessionLoadAU, estimate1RM, skillsRadar, patternVolume, acwr,
} from "./trainingEngine";

export interface ExercisePR {
  weightKg: number;
  reps: string;
  dayId: string;
  timestamp: number | null;
}

export interface AthleteStatsDoc {
  schemaVersion: 1;
  updatedAt: string;
  identity: string;
  level: string;
  xpTotal: number;
  daysCompleted: number;
  perfectWeeks: number;
  achievements: string[];
  questsCompleted: number;
  questXp: number;
  totalVolumeKg: number;
  totalSets: number;
  movementsLogged: number;
  avgRpe: number | null;
  weeklyVolumeKg: Record<string, number>;
  prs: Record<string, ExercisePR>;
  // ── Structured-session (engine-derived) CrossFit metrics — additive ──
  structuredSessions: number;
  /** best estimated 1RM (Epley) per movement, from the structured sessions */
  e1rmPrs: Record<string, number>;
  /** modality work split (M/G/W), as percentages */
  modalBalancePct: { M: number; G: number; W: number };
  /** acute:chronic workload ratio (null until ~4 weeks of data) */
  acwr: number | null;
  /** Foster training load over the last 7 days (AU) */
  weeklyLoadAU: number;
  /** the 10 general physical skills, scored 0..100 by exposure */
  skillsRadar: Record<string, number>;
  /** tonnage (kg) grouped by movement pattern */
  patternTonnageKg: Record<string, number>;
}

// Unit-aware legacy parsers: "400m" in the weight field is cardio, not 400 kg.
const numFrom = parseLoggedNumber;

// Firestore map keys cannot contain ~ * / [ ] and dotted keys are ambiguous.
const safeFieldKey = (s: string): string =>
  s.replace(/[~*/\[\].]/g, "_").trim() || "_";

/** Pure scan of localStorage → canonical stats snapshot. */
export function computeAthleteStats(): AthleteStatsDoc {
  // ── Athlete identity ──────────────────────────────────────────────────
  let identity = "ATLETA NEXUS";
  let level = "";
  try {
    const raw = localStorage.getItem("nexus_athlete_state");
    if (raw) {
      const a = JSON.parse(raw);
      if (a?.identity) identity = String(a.identity);
      if (a?.level) level = String(a.level);
    }
  } catch {
    /* ignore */
  }

  // ── Achievements & side quests ────────────────────────────────────────
  let achievements: string[] = [];
  try {
    const raw = localStorage.getItem("nexus_unlocked_achievements");
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) achievements = parsed.map(String);
  } catch {
    /* ignore */
  }

  let questsCompleted = 0;
  let questXp = 0;
  try {
    const raw = localStorage.getItem("nexus_daily_quests_v2");
    const quests = raw ? JSON.parse(raw) : {};
    Object.values(quests || {}).forEach((q: any) => {
      if (q?.completed) {
        questsCompleted++;
        questXp += Number(q.xpEarned) || 0;
      }
    });
  } catch {
    /* ignore */
  }

  // ── Completed days & perfect weeks ────────────────────────────────────
  let daysCompleted = 0;
  let perfectWeeks = 0;
  const weekCompletion: Record<string, number> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && /^w\d+d\d+$/.test(key) && localStorage.getItem(key) === "true") {
      daysCompleted++;
      const wk = key.slice(0, key.indexOf("d"));
      weekCompletion[wk] = (weekCompletion[wk] || 0) + 1;
    }
  }
  Object.values(weekCompletion).forEach((count) => {
    if (count >= 7) perfectWeeks++;
  });

  // Same formula as the in-app XP bar (App.getXpProgress).
  const xpTotal = 800 + daysCompleted * 100 + questXp;

  // ── Telemetry scan: volume, sets, RPE, PRs ───────────────────────────
  let totalVolumeKg = 0;
  let totalSets = 0;
  let movementsLogged = 0;
  let rpeSum = 0;
  let rpeCount = 0;
  const weeklyVolumeKg: Record<string, number> = {};
  const prs: Record<string, ExercisePR> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("nexus_logs_")) continue;
    try {
      const sets = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(sets) || sets.length === 0) continue;

      const withoutPrefix = key.slice("nexus_logs_".length);
      const firstUnderscore = withoutPrefix.indexOf("_");
      const dayId =
        firstUnderscore === -1
          ? withoutPrefix
          : withoutPrefix.slice(0, firstUnderscore);
      const derivedName =
        firstUnderscore === -1
          ? ""
          : withoutPrefix.slice(firstUnderscore + 1).replace(/_/g, " ");
      const weekKey = dayId.slice(0, dayId.indexOf("d") > 0 ? dayId.indexOf("d") : 2);

      movementsLogged++;

      sets.forEach((set: any) => {
        totalSets++;
        const weight = parseLoggedWeightKg(set.weight);
        const reps = numFrom(set.reps);
        const volume = weight * reps;
        totalVolumeKg += volume;
        if (weekKey) {
          weeklyVolumeKg[weekKey] = (weeklyVolumeKg[weekKey] || 0) + volume;
        }

        const rpe = parseFloat(set.rpe);
        if (!isNaN(rpe) && rpe > 0) {
          rpeSum += rpe;
          rpeCount++;
        }

        if (weight > 0) {
          const name =
            (set.exName && String(set.exName).trim()) ||
            cleanExerciseLabel(derivedName) ||
            derivedName;
          const prKey = safeFieldKey(name);
          if (!prs[prKey] || weight > prs[prKey].weightKg) {
            prs[prKey] = {
              weightKg: weight,
              reps: String(set.reps ?? ""),
              dayId,
              timestamp: typeof set.timestamp === "number" ? set.timestamp : null,
            };
          }
        }
      });
    } catch {
      /* skip malformed entries */
    }
  }

  // Keep the document small: top 50 PRs by weight.
  const trimmedPrs: Record<string, ExercisePR> = {};
  Object.entries(prs)
    .sort((a, b) => b[1].weightKg - a[1].weightKg)
    .slice(0, 50)
    .forEach(([k, v]) => {
      trimmedPrs[k] = v;
    });

  // ── Structured sessions → engine-derived CrossFit metrics (additive) ──
  const bw = getBodyweightKg();
  const sessions = loadSessions();
  const e1rmRaw: Record<string, number> = {};
  const modalWork = { M: 0, G: 0, W: 0 };
  const dailyLoads: Record<string, number> = {};
  for (const s of sessions) {
    const t = sessionTotals(s, bw);
    modalWork.M += t.modalityWorkJ.M;
    modalWork.G += t.modalityWorkJ.G;
    modalWork.W += t.modalityWorkJ.W;
    const load = sessionLoadAU(s);
    if (load != null) dailyLoads[s.date] = (dailyLoads[s.date] || 0) + load;
    for (const set of s.sets) {
      const e = estimate1RM(set.weightKg, set.reps);
      if (e != null) {
        const k = safeFieldKey(set.exerciseName);
        e1rmRaw[k] = Math.max(e1rmRaw[k] || 0, Math.round(e));
      }
    }
  }
  const modalTot = modalWork.M + modalWork.G + modalWork.W;
  const modalBalancePct = {
    M: modalTot > 0 ? Math.round((modalWork.M / modalTot) * 100) : 0,
    G: modalTot > 0 ? Math.round((modalWork.G / modalTot) * 100) : 0,
    W: modalTot > 0 ? Math.round((modalWork.W / modalTot) * 100) : 0,
  };
  const loadDays = Object.keys(dailyLoads).length;
  const todayISO = new Date().toISOString().slice(0, 10);
  const acwrVal = loadDays >= 7 ? acwr(dailyLoads, todayISO) : null;
  let weeklyLoadAU = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weeklyLoadAU += dailyLoads[d.toISOString().slice(0, 10)] || 0;
  }
  const skillsRadarOut: Record<string, number> = sessions.length ? skillsRadar(sessions) : {};
  const patternTonnageKg: Record<string, number> = {};
  if (sessions.length) {
    const pv = patternVolume(sessions, bw);
    Object.entries(pv).forEach(([p, v]) => {
      if (v.sets > 0) patternTonnageKg[p] = v.tonnageKg;
    });
  }
  const e1rmPrs: Record<string, number> = {};
  Object.entries(e1rmRaw)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .forEach(([k, v]) => {
      e1rmPrs[k] = v;
    });

  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    identity,
    level,
    xpTotal,
    daysCompleted,
    perfectWeeks,
    achievements,
    questsCompleted,
    questXp,
    totalVolumeKg: Math.round(totalVolumeKg),
    totalSets,
    movementsLogged,
    avgRpe: rpeCount > 0 ? Math.round((rpeSum / rpeCount) * 10) / 10 : null,
    weeklyVolumeKg,
    prs: trimmedPrs,
    structuredSessions: sessions.length,
    e1rmPrs,
    modalBalancePct,
    acwr: acwrVal,
    weeklyLoadAU: Math.round(weeklyLoadAU),
    skillsRadar: skillsRadarOut,
    patternTonnageKg,
  };
}

/** Compute and push the stats snapshot to users/{uid}/profile/stats. */
export async function pushAthleteStats(userId: string): Promise<void> {
  const stats = computeAthleteStats();
  const ref = doc(db, "users", userId, "profile", "stats");
  await setDoc(ref, stats);
}
