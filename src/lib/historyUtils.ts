import { loadCachedWorkouts, getDefaultProgram } from "./sheetImport";
import { STORAGE_KEYS, parseDayId } from "./storageKeys";

// Cue detection + name cleaning live in the dependency-free cueDetection module
// (so sheetImport can mark cues at import time without a cycle). Re-exported
// here for the existing consumers that import them from historyUtils.
export {
  cleanExerciseLabel,
  isCueOrNote,
  getCleanExerciseName,
} from "./cueDetection";
import { getCleanExerciseName } from "./cueDetection";

interface StoredSet {
  weight?: string;
  reps?: string;
  rpe?: string;
  rir?: string;
  timestamp?: number;
}

interface HistorySession {
  dayId: string;
  dayName: string;
  weekNum: number;
  sets: {
    weight: string;
    reps: string;
    rpe: string;
    rir?: string;
    timestamp: number;
  }[];
}

// Helper to extract last 5 sessions from localStorage logs
export const getExerciseHistory = (rawItem: string): HistorySession[] => {
  const sessions: HistorySession[] = [];
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }

    const cleanItem = getCleanExerciseName(rawItem);
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const itemNorm = normalize(cleanItem);

    if (!itemNorm) return [];

    // Resolve day names from the live per-user program, not a bundled snapshot.
    const program = loadCachedWorkouts() || getDefaultProgram();

    const storageLength = localStorage.length;
    for (let i = 0; i < storageLength; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.LOGS_PREFIX)) {
        const parts = key.split("_");
        if (parts.length >= 4) {
          const dayId = parts[2]; // e.g. "w2d2"
          const storedExerciseName = parts.slice(3).join(" "); // e.g. "Deadlift Tradicional"

          const keyNorm = normalize(storedExerciseName);

          if (
            keyNorm &&
            (itemNorm.includes(keyNorm) || keyNorm.includes(itemNorm))
          ) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const sets: StoredSet[] = JSON.parse(raw);
                if (Array.isArray(sets) && sets.length > 0) {
                  const parsed = parseDayId(dayId);
                  const weekNum = parsed?.week ?? 1;
                  const dNum = parsed ? String(parsed.day) : dayId.substring(3);
                  let dayName = `W${weekNum}D${dNum}`;

                  const weekPlan = program[`w${weekNum}`];
                  if (weekPlan) {
                    const dObj = weekPlan.days.find((d) => d.id === dayId);
                    if (dObj) {
                      dayName = `S${weekNum} - ${dObj.name}`;
                    }
                  }

                  sessions.push({
                    dayId,
                    dayName,
                    weekNum,
                    sets: sets.map((s) => ({
                      weight: s.weight || "",
                      reps: s.reps || "",
                      rpe: s.rpe || "",
                      rir: s.rir || "",
                      timestamp: s.timestamp || 0,
                    })),
                  });
                }
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("localStorage restricted inside current browsing sandbox:", err);
    return [];
  }

  // Sort by latest session's newest set timestamp
  try {
    sessions.sort((a, b) => {
      const aMaxTime = Math.max(...a.sets.map((s) => s.timestamp), 0);
      const bMaxTime = Math.max(...b.sets.map((s) => s.timestamp), 0);
      return bMaxTime - aMaxTime; // Newest first
    });
  } catch (e) {
    // ignore sort failures
  }

  return sessions.slice(0, 5);
};
