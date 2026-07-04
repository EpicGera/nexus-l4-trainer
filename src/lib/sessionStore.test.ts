import { describe, it, expect, beforeEach } from "vitest";
import {
  recordManualLog, getSessionForDay, saveSession, backfillMetconDerivedSets,
} from "./sessionStore";
import { TrainingSession } from "../types/training";

describe("recordManualLog (manual → structured bridge)", () => {
  beforeEach(() => localStorage.clear());

  it("mirrors a manual loaded-lift log into a structured session", () => {
    recordManualLog("w1d1", "Back Squat", [
      { id: "a", weight: "100 kg", reps: "5 reps", rpe: "8", rir: "2", timestamp: 111 },
    ]);
    const s = getSessionForDay("w1d1");
    expect(s).toBeTruthy();
    expect(s!.sets).toHaveLength(1);
    expect(s!.sets[0].exerciseId).toBe("back-squat");
    expect(s!.sets[0].weightKg).toBe(100);
    expect(s!.sets[0].reps).toBe(5);
    expect(s!.sets[0].rpe).toBe(8);
    expect(s!.sets[0].isBodyweight).toBe(false);
  });

  it("treats a non-kg weight as bodyweight", () => {
    recordManualLog("w1d4", "Pull-up", [{ weight: "P. Corporal", reps: "10 reps", rpe: "7" }]);
    const s = getSessionForDay("w1d4");
    expect(s!.sets[0].isBodyweight).toBe(true);
    expect(s!.sets[0].weightKg).toBeNull();
    expect(s!.sets[0].reps).toBe(10);
  });

  it("routes cardio ergs to calories and replaces (not appends) on re-save", () => {
    recordManualLog("w1d2", "Row", [{ weight: "", reps: "15cal", rpe: "7" }]);
    let s = getSessionForDay("w1d2");
    expect(s!.sets[0].exerciseId).toBe("row-erg");
    expect(s!.sets[0].calories).toBe(15);
    expect(s!.sets[0].weightKg).toBeNull();

    recordManualLog("w1d2", "Row", [{ weight: "", reps: "20cal", rpe: "8" }]);
    s = getSessionForDay("w1d2");
    expect(s!.sets.filter((x) => x.exerciseName === "Row")).toHaveLength(1);
    expect(s!.sets[0].calories).toBe(20);
  });

  it("merges into the day's session without dropping other movements", () => {
    recordManualLog("w1d3", "Back Squat", [{ weight: "100 kg", reps: "5", rpe: "8" }]);
    recordManualLog("w1d3", "Deadlift", [{ weight: "140 kg", reps: "3", rpe: "9" }]);
    const s = getSessionForDay("w1d3");
    expect(s!.sets).toHaveLength(2);
  });
});

describe("backfillMetconDerivedSets (retroactivo)", () => {
  beforeEach(() => localStorage.clear());

  const db = {
    w1: {
      days: [{
        id: "w1d1", name: "LUNES", title: "X",
        variations: [{
          tabName: "RX",
          warmup: { title: "", scheme: "", items: [] },
          strength: { title: "", scheme: "", items: [] },
          metcon: { title: "METCON", scheme: "AMRAP 14 MIN", items: ["15 Cal Row", "10 Burpees"] },
          accessories: { title: "", scheme: "", items: [] },
        }],
      }],
    },
  } as any;

  const oldSession = (): TrainingSession => ({
    id: "sess_w1d1_old", date: "2026-06-20", dayId: "w1d1", completed: true,
    durationMin: 40, sessionRpe: 8,
    metcon: { format: "amrap", scaling: "rx", rounds: 4 },
    sets: [],
  });

  it("expande sesiones viejas con las cantidades reales del programa", () => {
    saveSession(oldSession());
    expect(backfillMetconDerivedSets(db)).toBe(1);
    const s = getSessionForDay("w1d1")!;
    expect(s.sets.find((x) => x.exerciseName === "Row")?.calories).toBe(60); // 15 × 4 REALES
    expect(s.sets.find((x) => x.exerciseName === "Burpees")?.reps).toBe(40);
  });

  it("es idempotente: la segunda pasada no duplica", () => {
    saveSession(oldSession());
    backfillMetconDerivedSets(db);
    expect(backfillMetconDerivedSets(db)).toBe(0);
    expect(getSessionForDay("w1d1")!.sets).toHaveLength(2);
  });

  it("no toca sesiones que ya traen sets del metcon (wizard nuevo)", () => {
    const s = oldSession();
    s.sets.push({
      id: "x", exerciseId: "row-erg", exerciseName: "Row", weightKg: null,
      isBodyweight: true, addedLoadKg: null, reps: null, distanceM: null,
      calories: 60, timeSec: null, rpe: null, rir: null, tempo: null,
      setType: "working", ts: 1, blockSlot: "b2_metcon",
    });
    saveSession(s);
    expect(backfillMetconDerivedSets(db)).toBe(0);
  });
});
