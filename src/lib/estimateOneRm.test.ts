import { describe, it, expect, beforeEach } from "vitest";
import { estimateOneRepMaxesFromLogs } from "./workingMax";

const SESSIONS_KEY = "nexus_sessions_v1";
const set = (exerciseId: string, weightKg: number | null, reps: number | null) => ({
  id: Math.random().toString(36), exerciseId, exerciseName: exerciseId, weightKg, isBodyweight: false,
  addedLoadKg: null, reps, distanceM: null, calories: null, timeSec: null, rpe: null, rir: null,
  tempo: null, setType: "working", ts: 0,
});

describe("estimateOneRepMaxesFromLogs (Epley over logs)", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the best estimate per exercise across sets", () => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([
      { id: "s1", date: "2026-06-14", dayId: "w1d1", completed: true, durationMin: 50, sessionRpe: 8,
        sets: [ set("back-squat", 100, 5), set("back-squat", 110, 3), set("deadlift", 140, 1) ] },
    ]));
    const est = estimateOneRepMaxesFromLogs();
    // back-squat: max(Epley(100,5)=117, Epley(110,3)=121) → 121
    expect(est["back-squat"]).toBe(121);
    expect(est["deadlift"]).toBe(140); // 1 rep = exact
  });

  it("ignores bodyweight / repless / capped sets and is empty with no logs", () => {
    expect(estimateOneRepMaxesFromLogs()).toEqual({});
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([
      { id: "s2", date: "2026-06-14", dayId: "w1d2", completed: true, durationMin: 10, sessionRpe: 7,
        sets: [ set("pull-up", null, 10), set("row-erg", null, null) ] },
    ]));
    expect(estimateOneRepMaxesFromLogs()).toEqual({});
  });
});
