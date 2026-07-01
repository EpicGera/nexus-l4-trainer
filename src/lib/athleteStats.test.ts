import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock firebase so the module loads without touching the network.
vi.mock("./firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
}));

import { computeAthleteStats } from "./athleteStats";

describe("computeAthleteStats", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns a neutral snapshot on a fresh install", () => {
    const stats = computeAthleteStats();
    expect(stats.schemaVersion).toBe(1);
    expect(stats.identity).toBe("ATLETA NEXUS");
    expect(stats.daysCompleted).toBe(0);
    expect(stats.perfectWeeks).toBe(0);
    expect(stats.totalVolumeKg).toBe(0);
    expect(stats.totalSets).toBe(0);
    expect(stats.avgRpe).toBeNull();
    expect(stats.xpTotal).toBe(800); // base XP only
    expect(Object.keys(stats.prs)).toHaveLength(0);
  });

  it("counts completed days, perfect weeks and XP", () => {
    for (let d = 1; d <= 7; d++) localStorage.setItem(`w1d${d}`, "true");
    localStorage.setItem("w2d1", "true");
    localStorage.setItem("w2d2", "false");

    const stats = computeAthleteStats();
    expect(stats.daysCompleted).toBe(8);
    expect(stats.perfectWeeks).toBe(1);
    expect(stats.xpTotal).toBe(800 + 8 * 100);
  });

  it("aggregates volume, sets, RPE and weekly distribution from logs", () => {
    localStorage.setItem(
      "nexus_logs_w1d1_Back_Squat",
      JSON.stringify([
        { weight: "100 kg", reps: "5 reps", rpe: "8" },
        { weight: "110 kg", reps: "3 reps", rpe: "9" },
      ])
    );
    localStorage.setItem(
      "nexus_logs_w2d3_Deadlift",
      JSON.stringify([{ weight: "140 kg", reps: "2 reps", rpe: "9" }])
    );

    const stats = computeAthleteStats();
    expect(stats.totalSets).toBe(3);
    expect(stats.movementsLogged).toBe(2);
    expect(stats.totalVolumeKg).toBe(100 * 5 + 110 * 3 + 140 * 2);
    expect(stats.weeklyVolumeKg.w1).toBe(830);
    expect(stats.weeklyVolumeKg.w2).toBe(280);
    expect(stats.avgRpe).toBeCloseTo((8 + 9 + 9) / 3, 1);
  });

  it("tracks the heaviest set per exercise as a PR, preferring exName", () => {
    localStorage.setItem(
      "nexus_logs_w1d1_Back_Squat",
      JSON.stringify([
        { weight: "100 kg", reps: "5 reps", rpe: "8", timestamp: 111 },
        { weight: "120 kg", reps: "1 reps", rpe: "9", exName: "Back Squat", timestamp: 222 },
      ])
    );

    const stats = computeAthleteStats();
    const pr = stats.prs["Back Squat"];
    expect(pr).toBeDefined();
    expect(pr.weightKg).toBe(120);
    expect(pr.dayId).toBe("w1d1");
    expect(pr.timestamp).toBe(222);
  });

  it("ignores bodyweight sets for PRs and skips malformed entries", () => {
    localStorage.setItem(
      "nexus_logs_w1d1_Pull_Ups",
      JSON.stringify([{ weight: "P. Corporal", reps: "10 reps", rpe: "7" }])
    );
    localStorage.setItem("nexus_logs_w1d2_Broken", "not json");

    const stats = computeAthleteStats();
    expect(Object.keys(stats.prs)).toHaveLength(0);
    expect(stats.totalSets).toBe(1); // bodyweight set still counts as a set
  });

  it("sanitizes PR keys for Firestore (no dots, slashes or brackets)", () => {
    localStorage.setItem(
      "nexus_logs_w1d1_X",
      JSON.stringify([
        { weight: "30 kg", reps: "5", rpe: "7", exName: "Press 27.5kg [plan/test]" },
      ])
    );

    const stats = computeAthleteStats();
    const keys = Object.keys(stats.prs);
    expect(keys).toHaveLength(1);
    expect(keys[0]).not.toMatch(/[~*/\[\].]/);
  });

  it("derives engine metrics from structured sessions (additive)", () => {
    expect(computeAthleteStats().structuredSessions).toBe(0); // neutral when none
    localStorage.setItem(
      "nexus_sessions_v1",
      JSON.stringify([{
        id: "s1", date: "2026-06-14", dayId: "w1d1", completed: true, durationMin: 50, sessionRpe: 8,
        sets: [{
          id: "x", exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 120, isBodyweight: false,
          addedLoadKg: null, reps: 3, distanceM: null, calories: null, timeSec: null, rpe: 8, rir: 2,
          tempo: null, setType: "working", ts: 0,
        }],
      }])
    );
    const stats = computeAthleteStats();
    expect(stats.structuredSessions).toBe(1);
    expect(stats.e1rmPrs["Back Squat"]).toBe(132); // Epley 120·(1+3/30)
    expect(stats.modalBalancePct.W).toBe(100);
  });

  it("reads achievements and quest XP", () => {
    localStorage.setItem(
      "nexus_unlocked_achievements",
      JSON.stringify(["first_day", "five_days"])
    );
    localStorage.setItem(
      "nexus_daily_quests_v2",
      JSON.stringify({
        w1d1: { completed: true, xpEarned: 150 },
        w1d2: { completed: false, xpEarned: 0 },
      })
    );

    const stats = computeAthleteStats();
    expect(stats.achievements).toEqual(["first_day", "five_days"]);
    expect(stats.questsCompleted).toBe(1);
    expect(stats.questXp).toBe(150);
    expect(stats.xpTotal).toBe(800 + 150);
  });
});
