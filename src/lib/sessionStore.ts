// Persistence for structured training sessions (the new model). Stored in
// localStorage under a nexus_-prefixed key so the sync engine roams it to
// Firestore per user. One logged session per program day slot (latest wins);
// re-doing a day overwrites. See docs/BLUEPRINT-modelo-atleta.md §3.3.

import { TrainingSession, LoggedSet } from "../types/training";
import { Database } from "../types/workout";
import { resolveOrInfer } from "../data/exerciseCatalog";
import { energyForExercise } from "./blockMeta";
import { expandMetconWork } from "./metconWork";
import { STORAGE_KEYS, buildLogsKey, parseDayId } from "./storageKeys";

const SESSIONS_KEY = STORAGE_KEYS.SESSIONS;

export function loadSessions(): TrainingSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as TrainingSession[]) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: TrainingSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    /* storage full / restricted — ignore */
  }
}

/** Upsert a session by its program day slot (dayId); falls back to id. */
export function saveSession(session: TrainingSession): void {
  const sessions = loadSessions();
  const key = session.dayId || session.id;
  const idx = sessions.findIndex((s) => (s.dayId || s.id) === key);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  saveSessions(sessions);
  try {
    window.dispatchEvent(new Event("nexus_logs_updated"));
  } catch {
    /* no window — ignore */
  }
}

export function getSessionForDay(dayId: string): TrainingSession | null {
  return loadSessions().find((s) => s.dayId === dayId) || null;
}

export function deleteSessionForDay(dayId: string): void {
  saveSessions(loadSessions().filter((s) => s.dayId !== dayId));
}

/**
 * Compatibility bridge: mirror a structured session's sets into the legacy
 * `nexus_logs_<dayId>_<Exercise_Name>` format that the rest of the app already
 * reads (analytics charts, history, athleteStats/game XP, daily-logging %). The
 * structured model stays the source of truth; this just keeps everything else
 * fed until those consumers migrate. Replaces (not appends) per exercise key so
 * re-doing a day overwrites cleanly.
 */
export function bridgeLegacyLogs(session: TrainingSession): void {
  if (!session.dayId) return;
  const byKey: Record<string, any[]> = {};
  for (const s of session.sets) {
    const key = buildLogsKey(session.dayId, s.exerciseName);
    (byKey[key] ||= []).push({
      id: s.id,
      weight: s.weightKg != null ? `${s.weightKg} kg` : "P. Corporal",
      reps: s.reps != null ? `${s.reps} reps` : "Max reps",
      rpe: s.rpe != null ? String(s.rpe) : "",
      rir: s.rir != null ? String(s.rir) : "",
      timestamp: s.ts,
    });
  }
  try {
    for (const [key, arr] of Object.entries(byKey)) {
      localStorage.setItem(key, JSON.stringify(arr));
    }
    window.dispatchEvent(new Event("nexus_logs_updated"));
  } catch {
    /* storage restricted — ignore */
  }
}

/**
 * Backfill RETROACTIVO de la expansión de metcon: las sesiones selladas antes
 * de que el wizard emitiera sets derivados (prescripción × rondas reales)
 * ganan sus cantidades REALES mirando el bloque metcon del programa activo.
 * Idempotente: una sesión que ya tiene sets del metcon no se toca.
 * ponytail: usa la primera variación del día (RX) — la sesión no registra cuál
 * se entrenó; si algún día se guarda la variación, afinar acá.
 */
export function backfillMetconDerivedSets(db: Database): number {
  const sessions = loadSessions();
  let touched = 0;

  for (const session of sessions) {
    const m = session.metcon;
    if (!m || !session.dayId) continue;
    if (session.sets.some((s) => (s.blockSlot || "").includes("metcon"))) continue;

    const parsed = parseDayId(session.dayId);
    if (!parsed) continue;
    const day = db[`w${parsed.week}`]?.days?.find((d) => d.id === session.dayId);
    const v = day?.variations?.[0];
    if (!v) continue;
    const metconBlocks = v.blocks?.filter((b) => b.bucket === "metcon") ?? [];
    const items = metconBlocks.length ? metconBlocks.flatMap((b) => b.items) : v.metcon?.items ?? [];
    const scheme = metconBlocks.length
      ? metconBlocks.map((b) => `${b.title ?? ""} ${b.scheme ?? ""}`).join(" · ")
      : v.metcon?.scheme ?? "";
    if (!items.length) continue;

    const derived = expandMetconWork(items, scheme, m);
    if (!derived.length) continue;

    const now = Date.now();
    derived.forEach((q, i) => {
      const ex = resolveOrInfer(q.name);
      session.sets.push({
        id: `set_retro_${now}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        exerciseId: ex.id,
        exerciseName: q.name,
        weightKg: q.weightKg,
        isBodyweight: q.weightKg == null,
        addedLoadKg: null,
        reps: q.reps,
        distanceM: q.distanceM,
        calories: q.calories,
        timeSec: null,
        rpe: null,
        rir: null,
        tempo: null,
        setType: "working",
        ts: now,
        blockSlot: metconBlocks[0]?.key ?? "metcon",
        blockTitle: "Metcon",
        energySystem: m.energySystem ?? energyForExercise(ex),
        timeDomain: m.timeDomain,
        blockCapSec: m.capSec,
      });
    });
    touched++;
  }

  if (touched > 0) {
    saveSessions(sessions);
    try {
      window.dispatchEvent(new Event("nexus_logs_updated"));
    } catch {
      /* no window — ignore */
    }
  }
  return touched;
}

const num = (v: unknown): number | null => {
  const m = String(v ?? "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};
const mmss = (v: unknown): number | null => {
  const s = String(v ?? "").trim();
  const m = s.match(/^(\d+):(\d{1,2})$/);
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
};

/**
 * Reverse bridge: mirror a manual ExerciseLogger save (legacy string entries)
 * into the structured session model, so manual logging feeds the new analysis /
 * engine / stats too — not just the wizard. Field routing uses the catalog's
 * work model (erg→calories, run→distance, else weight/reps). Merges into the
 * day's session (replacing only this exercise's sets, preserving wizard metcon/
 * sRPE and other movements).
 */
export function recordManualLog(dayId: string, exerciseName: string, legacyEntries: any[]): void {
  if (!dayId || !exerciseName) return;
  const ex = resolveOrInfer(exerciseName);
  const newSets: LoggedSet[] = (legacyEntries || []).map((e, i) => {
    const set: LoggedSet = {
      id: e?.id || `manual_${Date.now()}_${i}`,
      exerciseId: ex.id,
      exerciseName,
      weightKg: null, isBodyweight: false, addedLoadKg: null, reps: null,
      distanceM: null, calories: null, timeSec: null,
      rpe: num(e?.rpe), rir: num(e?.rir), tempo: null, setType: "working",
      ts: typeof e?.timestamp === "number" ? e.timestamp : Date.now(),
    };
    if (ex.workModel === "erg-calories") {
      set.calories = num(e?.reps);
      set.timeSec = mmss(e?.weight);
    } else if (ex.workModel === "distance") {
      set.distanceM = num(e?.reps);
      set.timeSec = mmss(e?.weight);
    } else {
      const w = String(e?.weight ?? "");
      if (/kg/i.test(w)) set.weightKg = num(w);
      else set.isBodyweight = true;
      set.reps = num(e?.reps);
    }
    return set;
  });

  const sessions = loadSessions();
  let session = sessions.find((s) => s.dayId === dayId);
  if (!session) {
    session = {
      id: `sess_${dayId}_manual`,
      date: new Date().toISOString().slice(0, 10),
      dayId,
      completed: false,
      durationMin: null,
      sessionRpe: null,
      sets: [],
    };
    sessions.push(session);
  }
  // Replace just this exercise's sets; keep the rest (and any wizard metcon/sRPE).
  session.sets = session.sets.filter((s) => s.exerciseName !== exerciseName).concat(newSets);
  saveSessions(sessions);
  try {
    window.dispatchEvent(new Event("nexus_logs_updated"));
  } catch {
    /* no window — ignore */
  }
}
