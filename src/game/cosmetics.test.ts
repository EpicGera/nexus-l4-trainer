import { describe, it, expect } from "vitest";
import { unlockCosmetics, Cosmetic } from "./cosmetics";

describe("unlockCosmetics — reliquias solo por logros reales", () => {
  it("un atleta sin logros baja sin reliquias (y sin errores)", () => {
    expect(unlockCosmetics({ perfectWeeks: 0, bestPrKg: 0, daysCompleted: 0 })).toEqual([]);
  });

  it("cada logro real desbloquea su reliquia", () => {
    const all = unlockCosmetics({ perfectWeeks: 2, bestPrKg: 120, daysCompleted: 25 });
    expect(all.map((c) => c.kind).sort()).toEqual(["aura", "mark", "trail"]);
    expect(all.find((c) => c.kind === "trail")?.source).toContain("120 kg");
  });

  it("umbrales: la marca pide 20 días; la estela pide al menos un PR", () => {
    expect(unlockCosmetics({ perfectWeeks: 0, bestPrKg: 0, daysCompleted: 19 })).toEqual([]);
    expect(
      unlockCosmetics({ perfectWeeks: 0, bestPrKg: 40, daysCompleted: 0 }).map((c) => c.kind),
    ).toEqual(["trail"]);
  });

  it("las reliquias son solo visuales: el tipo no admite campos de stats", () => {
    const c: Cosmetic = unlockCosmetics({ perfectWeeks: 1, bestPrKg: 0, daysCompleted: 0 })[0];
    // el contrato: id/kind/name/color/source y nada más
    expect(Object.keys(c).sort()).toEqual(["color", "id", "kind", "name", "source"]);
  });
});
