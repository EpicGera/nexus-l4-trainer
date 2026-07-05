import { describe, it, expect, beforeEach } from "vitest";
import {
  getAthleteBio, setAthleteBio, getSkillLevels, setSkillLevels,
  isOnboardingDone, markOnboardingDone, needsOnboarding,
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
    // atleta nuevo sin datos → sí
    expect(needsOnboarding({ hasBodyweight: false, hasOneRm: false, hasSessions: false })).toBe(true);
    // usuario con historial pero sin flag → NO molestar
    expect(needsOnboarding({ hasBodyweight: false, hasOneRm: false, hasSessions: true })).toBe(false);
    // una vez completado → nunca más
    expect(isOnboardingDone()).toBe(false);
    markOnboardingDone();
    expect(isOnboardingDone()).toBe(true);
    expect(needsOnboarding({ hasBodyweight: false, hasOneRm: false, hasSessions: false })).toBe(false);
  });
});
