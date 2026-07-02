import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getMonthlyVolumeStats } from './exportService';

describe('getMonthlyVolumeStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return zeroed stats when localStorage is empty', () => {
    const stats = getMonthlyVolumeStats();

    expect(stats.totalVolume).toBe(0);
    expect(stats.totalLogsCount).toBe(0);
    // Week keys are dynamic now (created on demand, any week number) — an
    // empty store yields empty maps, not the old fixed w1..w6 dict.
    expect(stats.weeklyVolume).toEqual({});
    expect(stats.weeklyCount).toEqual({});
    expect(stats.weeklyRpeSum).toEqual({});
    expect(stats.weeklyRpeCount).toEqual({});
  });

  it('counts week 7+ and rejects cardio strings stored as weight', () => {
    localStorage.setItem(
      'nexus_logs_w7d1_squat',
      JSON.stringify([{ weight: '80 kg', reps: 5, rpe: 8 }]),
    );
    localStorage.setItem(
      'nexus_logs_w7d2_row',
      JSON.stringify([{ weight: '400m', reps: 1, rpe: 7 }]),
    );
    const stats = getMonthlyVolumeStats();
    expect(stats.weeklyVolume.w7).toBe(400); // 80×5; the 400m adds 0 kg
    expect(stats.weeklyRpeCount.w7).toBe(2); // RPE still counts for cardio
  });

  it('should ignore irrelevant keys in localStorage', () => {
    localStorage.setItem('some_other_key', JSON.stringify([{ weight: 100, reps: 5 }]));
    const stats = getMonthlyVolumeStats();
    expect(stats.totalVolume).toBe(0);
  });

  it('should process valid logs and aggregate stats correctly', () => {
    // Key format: nexus_logs_{dayId}_{exerciseName}
    // wkKey is extracted from first 2 chars of dayId.
    const w1Log = [
      { weight: 100, reps: 5, rpe: 8 }, // volume = 500
      { weight: 100, reps: 5, rpe: 8.5 } // volume = 500
    ];
    localStorage.setItem('nexus_logs_w1d1_squat', JSON.stringify(w1Log));

    const w2Log = [
      { weight: 110, reps: 4, rpe: 9 } // volume = 440
    ];
    localStorage.setItem('nexus_logs_w2d2_bench', JSON.stringify(w2Log));

    const stats = getMonthlyVolumeStats();

    expect(stats.totalVolume).toBe(1440);
    expect(stats.totalLogsCount).toBe(2); // 2 sets of logs (keys)

    expect(stats.weeklyVolume.w1).toBe(1000);
    expect(stats.weeklyVolume.w2).toBe(440);

    expect(stats.weeklyRpeSum.w1).toBe(16.5);
    expect(stats.weeklyRpeCount.w1).toBe(2);

    expect(stats.weeklyRpeSum.w2).toBe(9);
    expect(stats.weeklyRpeCount.w2).toBe(1);

    expect(stats.weeklyCount.w1).toBe(1); // 1 key for w1
    expect(stats.weeklyCount.w2).toBe(1); // 1 key for w2
  });

  it('should handle sets with missing/invalid weight/reps/RPE', () => {
    const invalidLog = [
      { weight: "invalid", reps: 5, rpe: 8 }, // volume = 0, RPE added
      { weight: 100, reps: "invalid", rpe: 8 }, // volume = 0, RPE added
      { weight: 100, reps: 5, rpe: "invalid" }, // volume = 500, RPE ignored
      { weight: 100, reps: 5 } // volume = 500, RPE ignored
    ];
    localStorage.setItem('nexus_logs_w1d1_deadlift', JSON.stringify(invalidLog));

    const stats = getMonthlyVolumeStats();

    expect(stats.totalVolume).toBe(1000); // 500 + 500
    expect(stats.weeklyVolume.w1).toBe(1000);
    expect(stats.weeklyRpeSum.w1).toBe(16);
    expect(stats.weeklyRpeCount.w1).toBe(2);
  });

  it('should gracefully handle invalid JSON in localStorage', () => {
    localStorage.setItem('nexus_logs_w1d1_squat', 'not valid json');
    const stats = getMonthlyVolumeStats();

    expect(stats.totalVolume).toBe(0);
    expect(stats.totalLogsCount).toBe(0);
  });
});
