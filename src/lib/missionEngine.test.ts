import { describe, it, expect } from "vitest";
import { deriveDayGoal, generateMission, validateMission } from "./missionEngine";
import type { DayVariation } from "./../types/workout";
import type { TrainingSession, LoggedSet } from "./../types/training";

const empty = { title: "", scheme: "", items: [] as string[] };
const variation = (over: Partial<DayVariation>): DayVariation => ({
  tabName: "RX",
  warmup: empty,
  strength: { title: "BACK SQUAT", scheme: "5x5 @ 80% WM", items: ["Back Squat 5x5 @ 80% WM"] },
  metcon: { title: "METCON", scheme: "AMRAP 12", items: ["15 Pull-ups", "10 Push Press"] },
  accessories: empty,
  ...over,
});

const set = (over: Partial<LoggedSet>): LoggedSet =>
  ({ id: "s", exerciseId: "e", exerciseName: "Back Squat", weightKg: 100, isBodyweight: false,
     addedLoadKg: null, reps: 5, distanceM: null, calories: null, timeSec: null, rpe: 7, rir: 2,
     tempo: null, setType: "working", ts: 0, ...over });

describe("deriveDayGoal", () => {
  it("arma el objetivo desde intención + fuerza + metcon", () => {
    const goal = deriveDayGoal(variation({}), { intention: "intensificacion" });
    expect(goal).toContain("INTENSIFICACIÓN");
    expect(goal).toContain("BACK SQUAT");
    expect(goal).toContain("METCON AMRAP 12");
  });
  it("sin variación → vacío", () => {
    expect(deriveDayGoal(undefined)).toBe("");
  });
});

describe("generateMission", () => {
  it("día de squat → misión de sentadilla/cuádriceps, estable por dayId", () => {
    const m1 = generateMission("w1d1", variation({}));
    const m2 = generateMission("w1d1", variation({}));
    expect(m1).toBe(m2); // determinista
    expect(m1).toMatch(/SENTADILLA|CUÁDRICEPS/);
  });
  it("deload (restauración) → misión de reset/SNC", () => {
    const m = generateMission("w4d1", variation({}), { intention: "restauracion" });
    expect(m).toMatch(/SNC|DELOAD/);
  });
});

describe("validateMission", () => {
  const noSession = validateMission("w1d1", null, variation({}));
  it("sin sesión → no ok, crítico falla", () => {
    expect(noSession.ok).toBe(false);
    expect(noSession.checks.find((c) => c.critical)?.pass).toBe(false);
  });

  it("sesión sellada con series y metcon → ok, todos los checks pasan", () => {
    const session: TrainingSession = {
      id: "x", date: "2026-07-10", dayId: "w1d1", completed: true, durationMin: 45,
      sessionRpe: 7, metcon: { format: "amrap", rounds: 5, reps: 3, scaling: "rx" },
      sets: [set({})],
    };
    const v = validateMission("w1d1", session, variation({}));
    expect(v.ok).toBe(true);
    expect(v.checks.every((c) => c.pass)).toBe(true);
  });

  it("sellada pero sin sustancia (sin series ni metcon) → no ok", () => {
    const session: TrainingSession = {
      id: "x", date: "2026-07-10", dayId: "w1d1", completed: true, durationMin: 10,
      sessionRpe: 7, sets: [],
    };
    const v = validateMission("w1d1", session, variation({ metcon: empty }));
    expect(v.ok).toBe(false);
  });
});
