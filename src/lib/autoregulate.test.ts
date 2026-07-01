import { describe, it, expect } from "vitest";
import { proposeAdjustments } from "./autoregulate";
import type { NexusScore, LiftScore } from "./nexusScore";

const lift = (over: Partial<LiftScore>): LiftScore => ({
  exerciseId: "back-squat", name: "Back Squat", avgRpe: 6, sets: 3, targetMid: 7.5, rpeDelta: -1.5, perf: "bajo", ...over,
});

const score = (over: Partial<NexusScore>): NexusScore => ({
  week: "w2", sessions: 3, hasData: true, score: 70, status: "", maxRpe: 7,
  lifts: [], metcons: [], prs: [], ...over,
});

describe("proposeAdjustments", () => {
  it("proposes wm-up when a lift was easy and no veto", () => {
    const r = proposeAdjustments(score({ lifts: [lift({})] }), { acwr: 1.0 });
    expect(r.vetoed).toBe(false);
    expect(r.adjustments[0]).toMatchObject({ kind: "wm-up", deltaPct: 2.5 });
  });

  it("vetoes up-regulation on high ACWR (holds at 0%)", () => {
    const r = proposeAdjustments(score({ lifts: [lift({})] }), { acwr: 1.5 });
    expect(r.vetoed).toBe(true);
    expect(r.adjustments[0]).toMatchObject({ kind: "wm-up", deltaPct: 0 });
    expect(r.vetoReason).toMatch(/ACWR/);
  });

  it("vetoes on a near-max RPE in the week", () => {
    const r = proposeAdjustments(score({ maxRpe: 9.5, lifts: [lift({})] }), { acwr: 1.0 });
    expect(r.vetoed).toBe(true);
    expect(r.adjustments[0].deltaPct).toBe(0);
  });

  it("proposes wm-down when a lift was above target", () => {
    const r = proposeAdjustments(score({ lifts: [lift({ perf: "sobre", avgRpe: 9, rpeDelta: 1.5 })] }), { acwr: 1.0 });
    expect(r.adjustments[0]).toMatchObject({ kind: "wm-down", deltaPct: -5 });
  });

  it("does not up-regulate a single-set easy lift", () => {
    const r = proposeAdjustments(score({ lifts: [lift({ sets: 1 })] }), { acwr: 1.0 });
    expect(r.adjustments.length).toBe(0);
  });

  it("emits a pr-bump even under veto", () => {
    const r = proposeAdjustments(
      score({ maxRpe: 9.5, prs: [{ exerciseId: "snatch", name: "Snatch", e1rm: 85, current: 80 }] }),
      { acwr: 1.0 },
    );
    expect(r.adjustments[0]).toMatchObject({ kind: "pr-bump", newOneRmKg: 85 });
  });
});
