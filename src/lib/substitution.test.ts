import { describe, it, expect } from "vitest";
import { convertDistance, distanceToBikeCal } from "./substitution";

describe("substitution matrix — aerobic ratios (cap. 45B)", () => {
  it("distance: 400m run = 500m row = 800m bike", () => {
    expect(convertDistance(400, "run", "row")).toBe(500);
    expect(convertDistance(400, "run", "ski")).toBe(500);
    expect(convertDistance(400, "run", "bike")).toBe(800);
  });
  it("distance is symmetric across machines", () => {
    expect(convertDistance(500, "row", "bike")).toBe(800);
    expect(convertDistance(800, "bike", "run")).toBe(400);
    expect(convertDistance(500, "ski", "run")).toBe(400);
  });
  it("calorie estimate: 400m run / 500m row ≈ 30 cal bike", () => {
    expect(distanceToBikeCal(400, "run")).toBe(30);
    expect(distanceToBikeCal(500, "row")).toBe(30);
    expect(distanceToBikeCal(0, "run")).toBe(0);
  });
});
