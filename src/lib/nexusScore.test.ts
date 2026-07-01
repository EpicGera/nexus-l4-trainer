import { describe, it, expect, beforeEach } from "vitest";
import { puntajeNexus } from "./nexusScore";
import { saveSessions } from "./sessionStore";
import { setOneRepMax } from "./workingMax";

const set = (over: any) => ({
  id: "s", exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 100, isBodyweight: false,
  addedLoadKg: null, reps: 5, distanceM: null, calories: null, timeSec: null, rpe: 6, rir: 4,
  tempo: null, setType: "working", ts: 0, ...over,
});

const session = (over: any) => ({
  id: "sess", date: "2026-06-01", dayId: "w2d1", completed: true, durationMin: 60, sessionRpe: 6,
  sets: [], ...over,
});

beforeEach(() => {
  localStorage.clear();
});

describe("puntajeNexus", () => {
  it("returns neutral with no data", () => {
    const r = puntajeNexus("w2");
    expect(r.hasData).toBe(false);
    expect(r.score).toBe(50);
  });

  it("scores an easy strength lift as 'bajo' (below the week band)", () => {
    setOneRepMax("back-squat", 200); // high 1RM so the 100kg sets aren't a PR
    saveSessions([session({ sets: [set({ rpe: 6 }), set({ rpe: 6 })] })]);
    const r = puntajeNexus("w2"); // w2 target mid = 7.5
    const bs = r.lifts.find((l) => l.exerciseId === "back-squat")!;
    expect(bs.perf).toBe("bajo");
    expect(bs.sets).toBe(2);
    expect(bs.targetMid).toBe(7.5);
    expect(r.maxRpe).toBe(6);
    expect(r.score).toBeGreaterThan(50);
  });

  it("scores a For-Time metcon under 85% of cap as 'arraso'", () => {
    saveSessions([
      session({ sets: [], metcon: { format: "fortime", capSec: 600, timeSec: 480, finished: true, scaling: "rx" } }),
    ]);
    const r = puntajeNexus("w2");
    expect(r.metcons[0].perf).toBe("arraso");
  });

  it("flags a DNF metcon", () => {
    saveSessions([
      session({ sets: [], metcon: { format: "fortime", capSec: 600, finished: false, repsAtCap: 40, scaling: "rx" } }),
    ]);
    expect(puntajeNexus("w2").metcons[0].perf).toBe("dnf");
  });

  it("detects a PR candidate over the stored 1RM", () => {
    setOneRepMax("back-squat", 100);
    saveSessions([session({ sets: [set({ weightKg: 100, reps: 5 })] })]); // e1RM ≈ 117 > 102
    const r = puntajeNexus("w2");
    expect(r.prs.find((p) => p.exerciseId === "back-squat")?.e1rm).toBeGreaterThan(110);
  });
});
