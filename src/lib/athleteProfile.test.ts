import { describe, it, expect, beforeEach } from "vitest";
import {
  getAthleteBio, setAthleteBio, getSkillLevels, setSkillLevels,
  isOnboardingDone, markOnboardingDone, needsOnboarding,
  getFullProfile, athleteProfileBrief, DEFAULT_PROFILE,
  setHealth, setCardioMarks, setKippingLevels, setLifeGear, setDiet,
} from "./athleteProfile";

describe("athleteProfile store", () => {
  beforeEach(() => localStorage.clear());

  it("bio round-trips y sanea valores inválidos", () => {
    setAthleteBio({ sex: "M", ageYears: 32, heightCm: 178 });
    expect(getAthleteBio()).toEqual({ sex: "M", ageYears: 32, heightCm: 178 });
    setAthleteBio({ sex: "F", ageYears: 0, heightCm: -5 });
    expect(getAthleteBio()).toEqual({ sex: "F", ageYears: null, heightCm: null });
  });

  it("skills round-trip", () => {
    setSkillLevels({ "pull-up": "rx", "muscle-up": "none" });
    expect(getSkillLevels()).toEqual({ "pull-up": "rx", "muscle-up": "none" });
  });

  it("onboarding flag + needsOnboarding", () => {
    expect(needsOnboarding({ hasBodyweight: false, hasOneRm: false, hasSessions: false })).toBe(true);
    expect(needsOnboarding({ hasBodyweight: false, hasOneRm: false, hasSessions: true })).toBe(false);
    markOnboardingDone();
    expect(isOnboardingDone()).toBe(true);
    expect(needsOnboarding({ hasBodyweight: false, hasOneRm: false, hasSessions: false })).toBe(false);
  });

  it("defaults sensatos cuando no hay datos (life-gear neutro)", () => {
    expect(getFullProfile().gear).toEqual(DEFAULT_PROFILE.gear);
    expect(getFullProfile().diet.approach).toBe("sin_definir");
  });
});

describe("athleteProfileBrief (la serialización que alimenta al generador)", () => {
  beforeEach(() => localStorage.clear());

  it("perfil vacío no produce ruido en el prompt", () => {
    expect(athleteProfileBrief()).toBe("");
  });

  it("renderiza lesiones, debilidades, cardio, kipping y life-gear como restricciones", () => {
    setAthleteBio({ sex: "M", ageYears: 30, heightCm: 175 });
    setCardioMarks({ ...DEFAULT_PROFILE.cardio, row500Sec: 105, run1kSec: 240 });
    setKippingLevels({ butterfly: "none", "kip-pullup": "rx" });
    setHealth({ injuries: "hombro derecho", weaknesses: "metcons largos" });
    setLifeGear({ sleep: "low", stress: "high", nutrition: "mid" });
    setDiet({ approach: "alta_proteina", restrictions: "sin gluten" });

    const brief = athleteProfileBrief();
    expect(brief).toContain("masculino, 30 años, 175 cm");
    expect(brief).toContain("Row 500 m 1:45"); // 105s → mm:ss
    expect(brief).toContain("hombro derecho"); // lesión → respetar
    expect(brief).toContain("metcons largos"); // debilidad → atacar
    expect(brief).toContain("butterfly"); // kipping no dominado → progresión
    expect(brief).toContain("Alta en proteína");
    expect(brief).toMatch(/Sueño.*→/); // life-gear con sugerencia
    expect(brief).not.toMatch(/Nutrición/); // "mid" es neutro: no se destaca
  });
});
