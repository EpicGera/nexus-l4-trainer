import { describe, it, expect } from "vitest";
import { parseLoggedNumber, parseLoggedWeightKg } from "./logParse";

describe("parseLoggedNumber", () => {
  it("parses plain and unit-suffixed numbers", () => {
    expect(parseLoggedNumber("80 kg")).toBe(80);
    expect(parseLoggedNumber("8")).toBe(8);
    expect(parseLoggedNumber("8-10")).toBe(8);
  });
  it("understands Spanish comma decimals", () => {
    expect(parseLoggedNumber("82,5")).toBe(82.5);
    expect(parseLoggedNumber("82,5 kg")).toBe(82.5);
  });
  it("returns 0 for non-numeric text", () => {
    expect(parseLoggedNumber("Max reps")).toBe(0);
    expect(parseLoggedNumber(null)).toBe(0);
  });
});

describe("parseLoggedWeightKg", () => {
  it("keeps real loads", () => {
    expect(parseLoggedWeightKg("80 kg")).toBe(80);
    expect(parseLoggedWeightKg("82,5")).toBe(82.5);
    expect(parseLoggedWeightKg("100")).toBe(100);
  });
  it("rejects cardio/time data stored in the weight field", () => {
    expect(parseLoggedWeightKg("400m")).toBe(0);
    expect(parseLoggedWeightKg("400 metros")).toBe(0);
    expect(parseLoggedWeightKg("2 km")).toBe(0);
    expect(parseLoggedWeightKg("12 cal")).toBe(0);
    expect(parseLoggedWeightKg("15 calorías")).toBe(0);
    expect(parseLoggedWeightKg("45 seg")).toBe(0);
    expect(parseLoggedWeightKg("45s")).toBe(0);
    expect(parseLoggedWeightKg("5 min")).toBe(0);
  });
  it("returns 0 for bodyweight text (external tonnage only)", () => {
    expect(parseLoggedWeightKg("P. Corporal")).toBe(0);
  });
});
