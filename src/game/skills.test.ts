import { describe, it, expect } from "vitest";
import { detectSkills, pickLoadout, SKILL_CATALOG } from "./skills";

describe("detectSkills", () => {
  it("unlocks the seismic slam from a real deadlift log", () => {
    const skills = detectSkills([{ name: "Heavy Deadlift", prKg: 125 }]);
    expect(skills).toHaveLength(1);
    expect(skills[0].id).toBe("falla_sismica");
    expect(skills[0].sourceMovement).toBe("Heavy Deadlift");
    expect(skills[0].sourcePrKg).toBe(125);
  });

  it("detects Spanish movement names", () => {
    const skills = detectSkills([
      { name: "Sentadilla Frontal", prKg: 90 },
      { name: "Peso Muerto Rumano", prKg: 110 },
      { name: "Dominadas estrictas", prKg: 0 },
    ]);
    const ids = skills.map((s) => s.id);
    expect(ids).toContain("coloso");
    expect(ids).toContain("falla_sismica");
    expect(ids).toContain("garra_ascendente");
  });

  it("unlocks cardio overdrive from weightless movements", () => {
    const skills = detectSkills([
      { name: "Row 500m", prKg: 0 },
      { name: "Assault Bike", prKg: 0 },
    ]);
    expect(skills.map((s) => s.id)).toEqual(["sobremarcha"]);
  });

  it("never duplicates a skill and keeps the highest-PR source", () => {
    const skills = detectSkills([
      { name: "Deadlift", prKg: 100 },
      { name: "Deadlift Tradicional", prKg: 140 },
      { name: "Sumo Deadlift", prKg: 120 },
    ]);
    expect(skills).toHaveLength(1);
    expect(skills[0].sourcePrKg).toBe(140);
    expect(skills[0].sourceMovement).toBe("Deadlift Tradicional");
  });

  it("orders by priority and ignores empty/unknown names", () => {
    const skills = detectSkills([
      { name: "", prKg: 50 },
      { name: "Yoga Flow", prKg: 0 },
      { name: "Burpees", prKg: 0 },
      { name: "Back Squat", prKg: 100 },
    ]);
    const ids = skills.map((s) => s.id);
    expect(ids).toEqual(["segundo_aliento", "coloso"]); // 88 > 70
  });

  it("returns empty for an athlete with no logs", () => {
    expect(detectSkills([])).toEqual([]);
  });
});

describe("pickLoadout", () => {
  it("equips at most 4 powers, highest priority first", () => {
    const skills = detectSkills([
      { name: "Deadlift", prKg: 100 },
      { name: "Back Squat", prKg: 90 },
      { name: "Snatch", prKg: 60 },
      { name: "Clean & Jerk", prKg: 80 },
      { name: "Pull ups", prKg: 0 },
      { name: "Burpees", prKg: 0 },
      { name: "Thrusters", prKg: 40 },
    ]);
    expect(skills.length).toBeGreaterThan(4);
    const loadout = pickLoadout(skills);
    expect(loadout).toHaveLength(4);
    // top priorities: falla_sismica 90, segundo_aliento 88, arranque_voltaico 85, garra_ascendente 80
    expect(loadout.map((s) => s.id)).toEqual([
      "falla_sismica",
      "segundo_aliento",
      "arranque_voltaico",
      "garra_ascendente",
    ]);
  });
});

describe("SKILL_CATALOG sanity", () => {
  it("has unique ids and valid numbers", () => {
    const ids = SKILL_CATALOG.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    SKILL_CATALOG.forEach((s) => {
      expect(s.cooldownMs).toBeGreaterThan(0);
      expect(s.cost).toBeGreaterThanOrEqual(0);
      expect(s.patterns.length).toBeGreaterThan(0);
    });
  });
});
