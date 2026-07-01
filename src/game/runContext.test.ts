import { describe, it, expect } from "vitest";
import {
  getBossWindow,
  buildRunContext,
  RNG,
  seedFromString,
  DESIGNATED_PEAK_WEEK,
  DESIGNATED_PEAK_DAY,
} from "./runContext";

describe("getBossWindow", () => {
  it("flags the designated peak day (week 3)", () => {
    const w = getBossWindow(DESIGNATED_PEAK_WEEK, DESIGNATED_PEAK_DAY);
    expect(w.isBossDay).toBe(true);
    expect(w.reason).toBe("peak");
  });

  it("flags the deload opener (w4, first day)", () => {
    const w = getBossWindow("w4", 0);
    expect(w.isBossDay).toBe(true);
    expect(w.reason).toBe("deload");
  });

  it("is NOT a boss day on ordinary days", () => {
    expect(getBossWindow("w1", 0).isBossDay).toBe(false);
    expect(getBossWindow("w2", 3).isBossDay).toBe(false);
    expect(getBossWindow("w3", 0).isBossDay).toBe(false); // peak week but wrong day
    expect(getBossWindow("w4", 1).isBossDay).toBe(false); // deload week but not opener
  });

  it("yields exactly two boss days across a full 4-week chapter", () => {
    let count = 0;
    for (const week of ["w1", "w2", "w3", "w4"]) {
      for (let d = 0; d < 7; d++) {
        if (getBossWindow(week, d).isBossDay) count++;
      }
    }
    expect(count).toBe(2);
  });
});

describe("buildRunContext", () => {
  it("uppercases the day name and marks boss days", () => {
    const ctx = buildRunContext({ week: "w3", dayIndex: DESIGNATED_PEAK_DAY, dayId: "w3d5", dayName: "Gargantúa V4" });
    expect(ctx.dayName).toBe("GARGANTÚA V4");
    expect(ctx.isBossDay).toBe(true);
    expect(ctx.bossReason).toBe("peak");
    expect(ctx.totalFloors).toBeGreaterThan(0);
  });

  it("falls back to a default day name and non-boss on ordinary days", () => {
    const ctx = buildRunContext({ week: "w1", dayIndex: 2, dayId: "w1d3", dayName: "" });
    expect(ctx.dayName).toBe("LA GRIETA");
    expect(ctx.isBossDay).toBe(false);
  });

  it("produces a stable seed for the same day", () => {
    const a = buildRunContext({ week: "w2", dayIndex: 1, dayId: "w2d2", dayName: "X" });
    const b = buildRunContext({ week: "w2", dayIndex: 1, dayId: "w2d2", dayName: "X" });
    expect(a.seed).toBe(b.seed);
  });
});

describe("RNG", () => {
  it("is deterministic for a given seed", () => {
    const a = new RNG(seedFromString("nexus"));
    const b = new RNG(seedFromString("nexus"));
    const seqA = [a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it("int stays within bounds", () => {
    const r = new RNG(123);
    for (let i = 0; i < 200; i++) {
      const v = r.int(3, 9);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(9);
    }
  });

  it("different seeds diverge", () => {
    expect(new RNG(1).next()).not.toBe(new RNG(2).next());
  });
});
