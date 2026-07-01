import { describe, it, expect } from "vitest";
import { parseSplits, tightGrouping, fmtSec } from "./tightGrouping";

describe("tightGrouping (cap. 43)", () => {
  it("parses mm:ss and raw seconds, mixed separators", () => {
    expect(parseSplits("1:52, 1:54 1:53")).toEqual([112, 114, 113]);
    expect(parseSplits("90\n92\n91")).toEqual([90, 92, 91]);
    expect(parseSplits("")).toEqual([]);
  });

  it("élite grouping: 500m rows 1:52–1:54 → tiny CV", () => {
    const r = tightGrouping(parseSplits("1:52 1:53 1:54 1:53"))!;
    expect(r.count).toBe(4);
    expect(r.spreadSec).toBe(2);
    expect(r.cvPct).toBeLessThan(2);
    expect(r.verdict).toBe("elite");
  });

  it("loose grouping: hero start then collapse → high CV", () => {
    const r = tightGrouping(parseSplits("100 110 125 145"))!;
    expect(r.verdict).toBe("loose");
    expect(r.fastestSec).toBe(100);
    expect(r.slowestSec).toBe(145);
  });

  it("needs at least two intervals", () => {
    expect(tightGrouping([113])).toBeNull();
    expect(tightGrouping([])).toBeNull();
  });

  it("formats seconds as mm:ss", () => {
    expect(fmtSec(113)).toBe("1:53");
    expect(fmtSec(45)).toBe("45s");
  });
});
