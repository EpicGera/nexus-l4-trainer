import { describe, it, expect } from "vitest";
import { QUEST_LOOT_POOL, getDayReward } from "./sideQuests";

describe("sideQuests", () => {
  it("getDayReward is deterministic for the same dayId", () => {
    const a = getDayReward("w1d1");
    const b = getDayReward("w1d1");
    expect(a).toEqual(b);
  });

  it("xp is within the hash's expected range (120-200, step 10)", () => {
    for (const dayId of ["w1d1", "w2d3", "w10d7", "w4d5", "w9d9"]) {
      const { xp } = getDayReward(dayId);
      expect(xp).toBeGreaterThanOrEqual(120);
      expect(xp).toBeLessThanOrEqual(200);
      expect((xp - 120) % 10).toBe(0);
    }
  });

  it("returned item is always one of QUEST_LOOT_POOL", () => {
    for (const dayId of ["w1d1", "w2d3", "w10d7", "w4d5", "w9d9"]) {
      const { item } = getDayReward(dayId);
      expect(QUEST_LOOT_POOL).toContain(item);
    }
  });
});
