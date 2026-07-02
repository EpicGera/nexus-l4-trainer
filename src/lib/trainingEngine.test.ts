import { describe, it, expect } from "vitest";
import { LoggedSet, TrainingSession } from "../types/training";
import {
  estimate1RM,
  setWorkJ,
  exerciseForSet,
  sessionTotals,
  sessionLoadAU,
  workingSeconds,
  timeDomain,
  classifyEnergySystem,
  acwr,
  monotonyStrain,
  patternVolume,
  skillsRadar,
  dominantModality,
} from "./trainingEngine";

function mkSet(p: Partial<LoggedSet>): LoggedSet {
  return {
    id: "x", exerciseId: "", exerciseName: "", weightKg: null, isBodyweight: false,
    addedLoadKg: null, reps: null, distanceM: null, calories: null, timeSec: null,
    rpe: null, rir: null, tempo: null, setType: "working", ts: 0, ...p,
  };
}
function mkSession(p: Partial<TrainingSession>): TrainingSession {
  return {
    id: "s", date: "2026-06-14", completed: true, durationMin: null,
    sessionRpe: null, sets: [], ...p,
  };
}
const work = (p: Partial<LoggedSet>, bw?: number) => {
  const set = mkSet(p);
  return setWorkJ(set, exerciseForSet(set), bw);
};

describe("estimate1RM (Epley)", () => {
  it("returns the weight at 1 rep and projects higher reps", () => {
    expect(estimate1RM(100, 1)).toBe(100);
    expect(estimate1RM(100, 5)).toBeCloseTo(116.7, 1);
  });
  it("guards invalid input", () => {
    expect(estimate1RM(100, 0)).toBeNull();
    expect(estimate1RM(0, 5)).toBeNull();
    expect(estimate1RM(100, 20)).toBeNull();
  });
});

describe("setWorkJ (work model per movement)", () => {
  it("load-displacement: load · g · displacement · reps", () => {
    expect(work({ exerciseId: "back-squat", weightKg: 100, reps: 5 })).toBeCloseTo(2451.66, 0);
  });
  it("bodyweight: bodyweight fraction · g · displacement · reps", () => {
    expect(work({ exerciseId: "pull-up", reps: 10 }, 80)).toBeCloseTo(4707.19, 0);
  });
  it("erg-calories: calories → joules", () => {
    expect(work({ exerciseId: "row-erg", calories: 20 })).toBe(83680);
  });
  it("none: skill/cardio movements fabricate no work", () => {
    expect(work({ exerciseId: "double-under", reps: 100 })).toBe(0);
  });
});

describe("sessionTotals", () => {
  it("aggregates work, modality split and power over working time", () => {
    const session = mkSession({
      metcon: { format: "fortime", timeSec: 300, scaling: "rx" },
      sets: [
        mkSet({ exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 100, reps: 5 }),
        mkSet({ exerciseId: "row-erg", exerciseName: "Row", calories: 20 }),
      ],
    });
    const t = sessionTotals(session, 80);
    expect(t.totalSets).toBe(2);
    expect(t.totalWorkJ).toBe(86132);
    expect(t.modalityWorkJ.W).toBeCloseTo(2451.66, 0);
    expect(t.modalityWorkJ.M).toBe(83680);
    expect(t.avgPowerW).toBe(287);
    expect(t.uncategorizedSets).toBe(0);
  });

  it("flags inferred (open-world) sets as uncategorized and gives null power without timing", () => {
    const session = mkSession({
      sets: [mkSet({ exerciseId: "inferred:yoke-carry", exerciseName: "Yoke Carry", weightKg: 90, reps: 1 })],
    });
    const t = sessionTotals(session);
    expect(t.uncategorizedSets).toBe(1);
    expect(t.avgPowerW).toBeNull();
  });
});

describe("training load", () => {
  it("sessionLoadAU = sRPE · duration (Foster), null when missing", () => {
    expect(sessionLoadAU(mkSession({ sessionRpe: 8, durationMin: 50 }))).toBe(400);
    expect(sessionLoadAU(mkSession({ sessionRpe: 8 }))).toBeNull();
  });

  it("workingSeconds prefers metcon time, then cap, then session duration", () => {
    expect(workingSeconds(mkSession({ metcon: { format: "fortime", timeSec: 240, scaling: "rx" } }))).toBe(240);
    expect(workingSeconds(mkSession({ metcon: { format: "amrap", capSec: 720, scaling: "rx" } }))).toBe(720);
    expect(workingSeconds(mkSession({ durationMin: 50 }))).toBe(3000);
    expect(workingSeconds(mkSession({}))).toBeNull();
  });

  it("acwr is 1.0 under steady load and null without chronic data", () => {
    const ref = "2026-06-28";
    const loads: Record<string, number> = {};
    for (let i = 0; i < 28; i++) {
      const d = new Date(Date.UTC(2026, 5, 28));
      d.setUTCDate(d.getUTCDate() - i);
      loads[d.toISOString().slice(0, 10)] = 400;
    }
    expect(acwr(loads, ref)).toBe(1);
    expect(acwr({}, ref)).toBeNull();
  });

  it("monotony/strain: flat nonzero week is MAX monotony (Apéndice K.5), not null", () => {
    // Identical loads across ≥2 days = the highest-risk case Foster warns about.
    const flat = monotonyStrain([400, 400, 400]);
    expect(flat.monotony).toBe(5);
    expect(flat.strain).toBe(1200 * 5);
    // Insufficient data stays null: a single day, or a week with zero load.
    expect(monotonyStrain([400]).monotony).toBeNull();
    expect(monotonyStrain([0, 0, 0]).monotony).toBeNull();
    const ms = monotonyStrain([400, 0, 400, 0, 400, 0, 0]);
    expect(ms.weeklyLoad).toBe(1200);
    expect(ms.monotony).toBeGreaterThan(0);
    expect(ms.strain).toBe(Math.round(1200 * (ms.monotony as number)));
  });
});

describe("classification", () => {
  it("timeDomain buckets", () => {
    expect(timeDomain(90)).toBe("sprint");
    expect(timeDomain(300)).toBe("short");
    expect(timeDomain(900)).toBe("medium");
    expect(timeDomain(1500)).toBe("long");
  });
  it("energy system by duration", () => {
    expect(classifyEnergySystem(8)).toBe("phosphagen");
    expect(classifyEnergySystem(90)).toBe("glycolytic");
    expect(classifyEnergySystem(600)).toBe("oxidative");
  });
});

describe("volume & skills", () => {
  const session = mkSession({
    sets: [
      mkSet({ exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 100, reps: 5 }),
      mkSet({ exerciseId: "deadlift", exerciseName: "Deadlift", weightKg: 120, reps: 3 }),
    ],
  });

  it("patternVolume groups sets/reps/tonnage by movement pattern", () => {
    const pv = patternVolume([session]);
    expect(pv.squat.tonnageKg).toBe(500);
    expect(pv.hinge.reps).toBe(3);
    expect(pv.hinge.tonnageKg).toBe(360);
  });

  it("skillsRadar scores trained skills 0..100", () => {
    const r = skillsRadar([session]);
    expect(r.strength).toBe(100); // most-trained skill
    expect(r.cardio).toBe(0);
  });

  it("dominantModality reflects where the work was", () => {
    expect(dominantModality(session, 80)).toBe("W");
  });
});
