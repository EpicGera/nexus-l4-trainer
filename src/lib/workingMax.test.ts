import { describe, it, expect, beforeEach } from "vitest";
import {
  getOneRepMaxes, setOneRepMax, getWorkingMax, parseWmPct, resolveWmRange, wmRangeLabel, setWmAdjustFactor,
} from "./workingMax";

describe("WMD: K only for barbell lifts, autoreg for all", () => {
  beforeEach(() => localStorage.clear());

  it("applies K to a main lift but uses the raw working load for an accessory", () => {
    localStorage.setItem("nexus_athlete_state", JSON.stringify({ kCoefficient: 0.85 }));
    setOneRepMax("back-squat", 100); // main → × K(0.85)
    setOneRepMax("kettlebell-swing", 24); // accessory → no K
    expect(getWorkingMax("back-squat")).toBe(85);
    expect(getWorkingMax("kettlebell-swing")).toBe(24);
  });

  it("autoregulation factor applies to both", () => {
    setOneRepMax("back-squat", 100); // K default 0.9
    setOneRepMax("kettlebell-swing", 24);
    setWmAdjustFactor("back-squat", 1.05);
    setWmAdjustFactor("kettlebell-swing", 1.05);
    expect(getWorkingMax("back-squat")).toBeCloseTo(94.5, 5); // 100 × 0.9 × 1.05
    expect(getWorkingMax("kettlebell-swing")).toBeCloseTo(25.2, 5); // 24 × 1 × 1.05
  });

  it("resolves % WM for a NON-main movement with a stored working load", async () => {
    const { resolveOrInfer } = await import("../data/exerciseCatalog");
    const id = resolveOrInfer("Bulgarian Split Squat").id;
    setOneRepMax(id, 60);
    const r = resolveWmRange("3x8 @ 70% WM", "Bulgarian Split Squat");
    expect(r?.lowKg).toBe(42); // 60 × 0.70 (no K, not a main lift)
  });
});

describe("workingMax store", () => {
  beforeEach(() => localStorage.clear());

  it("stores and clears 1RM, derives Working Max at 90%", () => {
    setOneRepMax("front-squat", 100);
    expect(getOneRepMaxes()["front-squat"]).toBe(100);
    expect(getWorkingMax("front-squat")).toBe(90);
    setOneRepMax("front-squat", 0); // clears
    expect(getWorkingMax("front-squat")).toBeNull();
  });
});

describe("parseWmPct", () => {
  it("parses ranges and singles only when WM token present", () => {
    expect(parseWmPct("4x6 @ 65-70% WM")).toEqual({ low: 65, high: 70 });
    expect(parseWmPct("5x3 @ 80% WM")).toEqual({ low: 80, high: 80 });
    expect(parseWmPct("3x5 @ 50% wm")).toEqual({ low: 50, high: 50 });
    expect(parseWmPct("4x6 @ 80-90kg")).toBeNull(); // absolute kg, no WM
    expect(parseWmPct("AMRAP 14 MIN")).toBeNull();
    expect(parseWmPct("4x6 @ 70%")).toBeNull(); // % without WM is ambiguous → skip
  });
});

describe("resolveWmRange", () => {
  beforeEach(() => localStorage.clear());

  it("resolves a scheme + lift to a kg range off the Working Max", () => {
    setOneRepMax("front-squat", 100); // WM = 90
    const r = resolveWmRange("4x6 @ 65-70% WM", "Front Squat");
    expect(r).toEqual({ lowKg: 58.5, highKg: 63, pctLow: 65, pctHigh: 70 });
    expect(wmRangeLabel(r!)).toBe("≈ 58.5–63 kg");
  });

  it("returns null without a stored 1RM, or without % WM", () => {
    expect(resolveWmRange("4x6 @ 65-70% WM", "Front Squat")).toBeNull(); // no 1RM
    setOneRepMax("front-squat", 100);
    expect(resolveWmRange("AMRAP 14 MIN", "Front Squat")).toBeNull(); // no % WM
  });
});
