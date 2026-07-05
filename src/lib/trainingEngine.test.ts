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
  modalMapCoverage,
  CARDIO_EST_W,
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
  it("none: skills fabricate no work, even with time logged (plank is G)", () => {
    expect(work({ exerciseId: "plank", timeSec: 60 })).toBe(0);
  });

  it("cardio chain: exact measure wins; logged time is the estimated fallback", () => {
    // calorías logueadas → exacto (la estimación no interviene)
    expect(work({ exerciseId: "row-erg", calories: 20, timeSec: 600 })).toBe(83680);
    // sin calorías pero con tiempo real → tiempo × CARDIO_EST_W
    expect(work({ exerciseId: "row-erg", timeSec: 600 })).toBe(600 * CARDIO_EST_W);
    // run sin metros pero con tiempo → estimado también
    expect(work({ exerciseId: "run", timeSec: 300 })).toBe(300 * CARDIO_EST_W);
  });

  it("jump rope: double-unders earn per-rep work via bodyweight (no more 0 J cardio)", () => {
    expect(work({ exerciseId: "double-under", reps: 100 }, 75)).toBeGreaterThan(4000);
    expect(work({ exerciseId: "single-under", reps: 100 }, 75)).toBeGreaterThan(0);
  });
});

describe("modalMapCoverage (el Hopper)", () => {
  it("splits session work across its REAL modalities (embedded cardio shows up)", () => {
    const session = mkSession({
      metcon: { format: "fortime", timeSec: 600, scaling: "rx" },
      sets: [
        mkSet({ exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 100, reps: 5 }),
        mkSet({ exerciseId: "row-erg", exerciseName: "Row", calories: 20 }),
      ],
    });
    const map = modalMapCoverage([session], 80);
    expect(map.W.medium).toBeGreaterThan(0); // pesas en su fila
    expect(map.M.medium).toBe(83680); // y el cardio embebido en la suya
  });

  it("falls back to the recorded timeDomain snapshot when no seconds were logged", () => {
    const session = mkSession({
      metcon: { format: "fortime", scaling: "rx", timeDomain: "short" },
      sets: [mkSet({ exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 100, reps: 5 })],
    });
    const map = modalMapCoverage([session], 80);
    expect(map.W.short).toBeGreaterThan(0); // antes esta sesión se descartaba
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

  it("tonnage counts external load only: bodyweight reps add 0 kg, added load counts", () => {
    // dominadas estrictas (BW puro) → 0 kg de tonelaje, pero sí cuentan reps
    expect(work({ exerciseId: "pull-up", reps: 12 }, 80)).toBeGreaterThan(0); // joules sí
    const strict = mkSession({ sets: [mkSet({ exerciseId: "pull-up", exerciseName: "Pull-up", reps: 12 })] });
    expect(patternVolume([strict])["vertical-pull"].tonnageKg).toBe(0);
    expect(patternVolume([strict])["vertical-pull"].reps).toBe(12);
    // con lastre: solo el lastre suma al tonelaje
    const weighted = mkSession({ sets: [mkSet({ exerciseId: "pull-up", exerciseName: "Pull-up", reps: 10, addedLoadKg: 20 })] });
    expect(patternVolume([weighted])["vertical-pull"].tonnageKg).toBe(200);
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
