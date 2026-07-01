import { describe, it, expect } from "vitest";
import { parseDayId, buildLogsKey, STORAGE_KEYS } from "./storageKeys";

describe("parseDayId", () => {
  it("parses single-digit weeks", () => {
    expect(parseDayId("w1d1")).toEqual({ week: 1, day: 1 });
    expect(parseDayId("w4d7")).toEqual({ week: 4, day: 7 });
  });

  it("parses multi-digit weeks (the substring(1,2) bug: w10 read as w1)", () => {
    expect(parseDayId("w10d1")).toEqual({ week: 10, day: 1 });
    expect(parseDayId("w12d3")).toEqual({ week: 12, day: 3 });
  });

  it("returns null for malformed ids", () => {
    expect(parseDayId("")).toBeNull();
    expect(parseDayId("week1")).toBeNull();
    expect(parseDayId("w1")).toBeNull();
  });
});

describe("buildLogsKey", () => {
  it("encodes spaces in the exercise name and keeps the legacy format", () => {
    expect(buildLogsKey("w1d1", "Back Squat")).toBe(
      `${STORAGE_KEYS.LOGS_PREFIX}w1d1_Back_Squat`,
    );
  });
});
