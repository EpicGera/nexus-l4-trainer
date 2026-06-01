import { WORKOUT_DATABASE } from "../data/workouts";

// Extract a clean name for query and display
export const getCleanExerciseName = (itemText: string): string => {
  let cleaned = itemText.replace(/<[^>]*>/g, "").trim();

  // Strip reps and times at the start of the item (e.g. "15 Box Step-overs", "Min 1: 8 Deadlifts", "4x4 ")
  cleaned = cleaned.replace(
    /^(Min\s+\d+:\s*)?\d+(\/\d+)?\s*(cal|calorie|calories|reps|repeticiones|m|crossovers)?\s+/i,
    "",
  );

  // Strip parenthesized text if it is long (e.g. instructions/cues) or contains weight indicators like "barra" or "kg"
  cleaned = cleaned.replace(/\s*\([^)]+barra[^)]*\)/i, "");
  cleaned = cleaned.replace(/\s*\([^)]+kg[^)]*\)/i, "");
  cleaned = cleaned.replace(/\s*@\s*[\d%-]+(\s*\(.*\))?/gi, "");
  cleaned = cleaned.replace(/\s*\([\d%-]+kg\)/gi, "");
  cleaned = cleaned.replace(/\s*\([^)]{15,}\)/g, ""); // strip parentheses with 15+ characters

  return cleaned.trim();
};

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

    const storageLength = localStorage.length;
    for (let i = 0; i < storageLength; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
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
                  const weekNum = parseInt(dayId.substring(1, 2), 10) || 1;
                  const dNum = dayId.substring(3);
                  let dayName = `W${weekNum}D${dNum}`;

                  const weekPlan = WORKOUT_DATABASE[`w${weekNum}`];
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
