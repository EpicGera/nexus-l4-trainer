import { describe, it, expect } from "vitest";
import { objectiveGapText, hasObjective, AthleteObjective } from "./athleteObjective";

const obj = (over: Partial<AthleteObjective>): AthleteObjective => ({
  statement: "", lifts: [], skills: [], ...over,
});

describe("athleteObjective", () => {
  it("hasObjective is false only when fully empty", () => {
    expect(hasObjective(obj({}))).toBe(false);
    expect(hasObjective(obj({ statement: "Open prep" }))).toBe(true);
    expect(hasObjective(obj({ lifts: [{ movement: "Snatch", targetKg: 80 }] }))).toBe(true);
  });

  it("computes the gap to the current mark", () => {
    const o = obj({ lifts: [{ movement: "Snatch", targetKg: 80 }] });
    const txt = objectiveGapText(o, [{ name: "Power Snatch", kg: 70 }]);
    expect(txt).toMatch(/Snatch: 70kg → 80kg \(faltan 10kg/);
  });

  it("flags a missing current mark", () => {
    const o = obj({ lifts: [{ movement: "Clean", targetKg: 100 }] });
    const txt = objectiveGapText(o, [{ name: "Back Squat", kg: 120 }]);
    expect(txt).toMatch(/Clean: objetivo 100kg \(sin marca actual/);
  });

  it("marks an already-met target", () => {
    const o = obj({ lifts: [{ movement: "Deadlift", targetKg: 100 }] });
    const txt = objectiveGapText(o, [{ name: "Deadlift", kg: 110 }]);
    expect(txt).toMatch(/Deadlift: 110kg ≥ objetivo 100kg/);
  });

  it("returns empty string when no objective", () => {
    expect(objectiveGapText(obj({}), [{ name: "Snatch", kg: 70 }])).toBe("");
  });

  it("includes statement, horizon and skills", () => {
    const o = obj({ statement: "Primer muscle-up", horizonChapters: 3, skills: ["Ring MU", "HSPU"] });
    const txt = objectiveGapText(o, []);
    expect(txt).toMatch(/Meta declarada: Primer muscle-up/);
    expect(txt).toMatch(/Horizonte: 3 capítulo/);
    expect(txt).toMatch(/Skills objetivo.*Ring MU, HSPU/);
  });
});
