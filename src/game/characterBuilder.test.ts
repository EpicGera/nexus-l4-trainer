import { describe, it, expect, beforeEach } from "vitest";
import { buildCharacter, collectLoggedMovements } from "./characterBuilder";
import { AthleteStatsDoc } from "../lib/athleteStats";

function baseStats(overrides: Partial<AthleteStatsDoc> = {}): AthleteStatsDoc {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    identity: "ATLETA NEXUS",
    level: "",
    xpTotal: 800,
    daysCompleted: 0,
    perfectWeeks: 0,
    achievements: [],
    questsCompleted: 0,
    questXp: 0,
    totalVolumeKg: 0,
    totalSets: 0,
    movementsLogged: 0,
    avgRpe: null,
    weeklyVolumeKg: {},
    prs: {},
    structuredSessions: 0,
    e1rmPrs: {},
    modalBalancePct: { M: 0, G: 0, W: 0 },
    acwr: null,
    weeklyLoadAU: 0,
    skillsRadar: {},
    patternTonnageKg: {},
    ...overrides,
  };
}

describe("buildCharacter", () => {
  it("builds a base Eco for a fresh athlete — playable but weak", () => {
    const c = buildCharacter(baseStats(), []);
    expect(c.vitality).toBe(120);
    expect(c.power).toBe(8);
    expect(c.stamina).toBe(80);
    expect(c.critChance).toBe(0.05);
    expect(c.moveSpeed).toBe(190);
    expect(c.rank).toBe("RECLUTA");
    expect(c.skills).toEqual([]);
    expect(c.loadout).toEqual([]);
  });

  it("scales vitality with real consistency", () => {
    const c = buildCharacter(
      baseStats({ daysCompleted: 20, perfectWeeks: 2 }),
      [],
    );
    expect(c.vitality).toBe(120 + 240 + 120); // 480
  });

  it("scales power with the best real PR", () => {
    const c = buildCharacter(
      baseStats({
        prs: {
          Deadlift: { weightKg: 140, reps: "1", dayId: "w3d5", timestamp: null },
          Squat: { weightKg: 100, reps: "1", dayId: "w3d1", timestamp: null },
        },
      }),
      [],
    );
    expect(c.power).toBe(Math.round(8 + 140 * 0.45)); // 71
  });

  it("derives crit from RPE discipline (closer to 7.5 = sharper)", () => {
    const sharp = buildCharacter(baseStats({ avgRpe: 7.5 }), []);
    const sloppy = buildCharacter(baseStats({ avgRpe: 10 }), []);
    expect(sharp.critChance).toBeCloseTo(0.35, 2);
    expect(sloppy.critChance).toBeCloseTo(0.1, 2);
  });

  it("unlocks skills from movements and equips a max-4 loadout", () => {
    const c = buildCharacter(baseStats(), [
      { name: "Deadlift", prKg: 120 },
      { name: "Back Squat", prKg: 100 },
      { name: "Snatch", prKg: 60 },
      { name: "Pull ups", prKg: 0 },
      { name: "Burpees", prKg: 0 },
    ]);
    expect(c.skills.length).toBe(5);
    expect(c.loadout.length).toBe(4);
  });

  it("ranks up with real XP", () => {
    expect(buildCharacter(baseStats({ xpTotal: 800 }), []).rank).toBe("RECLUTA");
    expect(buildCharacter(baseStats({ xpTotal: 1600 }), []).rank).toBe("CENTURIÓN");
    expect(buildCharacter(baseStats({ xpTotal: 12000 }), []).rank).toBe("TITÁN");
  });

  it("caps stats so the game stays balanced", () => {
    const c = buildCharacter(
      baseStats({
        daysCompleted: 500,
        perfectWeeks: 50,
        totalVolumeKg: 10_000_000,
        prs: { X: { weightKg: 5000, reps: "1", dayId: "w1d1", timestamp: null } },
      }),
      [],
    );
    expect(c.vitality).toBe(999);
    expect(c.power).toBe(150);
    expect(c.stamina).toBe(250);
  });
});

describe("collectLoggedMovements", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("collects movement names with their best weight from real log keys", () => {
    localStorage.setItem(
      "nexus_logs_w1d1_Back_Squat",
      JSON.stringify([
        { weight: "80 kg", reps: "5 reps" },
        { weight: "100 kg", reps: "1 reps" },
      ]),
    );
    localStorage.setItem(
      "nexus_logs_w2d3_Row_500m",
      JSON.stringify([{ weight: "P. Corporal", reps: "500m" }]),
    );

    const movements = collectLoggedMovements();
    const squat = movements.find((m) => m.name.includes("Back Squat"));
    const row = movements.find((m) => m.name.includes("Row"));
    expect(squat?.prKg).toBe(100);
    expect(row?.prKg).toBe(0);
  });

  it("prefers the clean exName stored in the set", () => {
    localStorage.setItem(
      "nexus_logs_w1d2_1__Deadlift_pesado_5x3",
      JSON.stringify([{ exName: "Deadlift", weight: "120 kg" }]),
    );
    const movements = collectLoggedMovements();
    expect(movements.find((m) => m.name === "Deadlift")?.prKg).toBe(120);
  });

  it("ignores malformed entries and non-log keys", () => {
    localStorage.setItem("nexus_logs_w1d1_Broken", "not json");
    localStorage.setItem("nexus_athlete_state", JSON.stringify({ identity: "X" }));
    expect(collectLoggedMovements()).toEqual([]);
  });
});
