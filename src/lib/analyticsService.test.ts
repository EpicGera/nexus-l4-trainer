import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  computeChartData,
  computeRpeDistributionData,
  computeRpeComparisonInfo,
  resetLogsCache,
} from './analyticsService';

describe('analyticsService - computeChartData', () => {
  beforeEach(() => {
    localStorage.clear();
    // The analytics cache lives at module scope; reset it so each test reads fresh
    // localStorage instead of a snapshot left over from the previous test.
    resetLogsCache();
  });

  afterEach(() => {
    localStorage.clear();
    resetLogsCache();
  });

  it('should return null RPE (no fabricated baselines) when no data exists', () => {
    const data = computeChartData('w1', 1);
    expect(data).toHaveLength(7);

    data.forEach((day) => {
      expect(day.rpe).toBeNull();
      expect(day.isReal).toBe(false);
    });
    expect(data.map((d) => d.name)).toEqual([
      'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM',
    ]);
  });

  it('should compute average RPE for a day with valid logs', () => {
    // Week w1, Day 1 (Monday)
    localStorage.setItem('nexus_logs_w1d1_1', JSON.stringify([
      { rpe: '8' },
      { rpe: '6' }
    ]));

    const data = computeChartData('w1', 1);
    expect(data[0]).toEqual({ name: 'LUN', rpe: 7.0, isReal: true });

    // Other days have no data — stay null, never invented
    expect(data[1]).toEqual({ name: 'MAR', rpe: null, isReal: false });
  });

  it('should format average RPE to 1 decimal place', () => {
    // (8 + 9 + 8) / 3 = 8.333... -> 8.3
    localStorage.setItem('nexus_logs_w1d1_1', JSON.stringify([
      { rpe: '8' },
      { rpe: '9' },
      { rpe: '8' }
    ]));

    const data = computeChartData('w1', 1);
    expect(data[0].rpe).toBe(8.3);
  });

  it('should ignore non-rpe entries or invalid rpe values', () => {
    localStorage.setItem('nexus_logs_w1d1_1', JSON.stringify([
      { rpe: '8' },
      { rpe: 'invalid' },
      { rpe: '-2' },
      { rpe: '0' },
      { otherField: 'test' },
      { rpe: '6' }
    ]));

    // Only '8' and '6' are valid. Average is 7.
    const data = computeChartData('w1', 1);
    expect(data[0].rpe).toBe(7.0);
    expect(data[0].isReal).toBe(true);
  });

  it('should return null if logs exist but have no valid RPEs', () => {
    localStorage.setItem('nexus_logs_w1d1_1', JSON.stringify([
      { rpe: 'invalid' },
      { rpe: '-2' }
    ]));

    const data = computeChartData('w1', 1);
    expect(data[0]).toEqual({ name: 'LUN', rpe: null, isReal: false });
  });

  it('should aggregate logs from multiple keys for the same day', () => {
    localStorage.setItem('nexus_logs_w1d1_1', JSON.stringify([{ rpe: '6' }]));
    localStorage.setItem('nexus_logs_w1d1_2', JSON.stringify([{ rpe: '10' }]));

    const data = computeChartData('w1', 1);
    expect(data[0].rpe).toBe(8.0); // (6 + 10) / 2
    expect(data[0].isReal).toBe(true);
  });

  it('should ignore keys from other weeks or unrelated keys', () => {
    localStorage.setItem('nexus_logs_w2d1_1', JSON.stringify([{ rpe: '10' }])); // Week 2
    localStorage.setItem('other_key', JSON.stringify([{ rpe: '10' }])); // Unrelated

    const data = computeChartData('w1', 1);
    expect(data[0].isReal).toBe(false);
    expect(data[0].rpe).toBeNull();
  });

  it('should gracefully handle malformed JSON', () => {
    localStorage.setItem('nexus_logs_w1d1_1', 'not json');
    localStorage.setItem('nexus_logs_w1d1_2', JSON.stringify([{ rpe: '8' }]));

    const data = computeChartData('w1', 1);
    expect(data[0].rpe).toBe(8.0);
    expect(data[0].isReal).toBe(true);
  });

  it('should gracefully handle non-array parsed JSON', () => {
    localStorage.setItem('nexus_logs_w1d1_1', JSON.stringify({ rpe: '8' })); // Object instead of array
    localStorage.setItem('nexus_logs_w1d1_2', JSON.stringify([{ rpe: '6' }]));

    const data = computeChartData('w1', 1);
    expect(data[0].rpe).toBe(6.0);
    expect(data[0].isReal).toBe(true);
  });
});

describe('analyticsService - computeRpeDistributionData', () => {
  beforeEach(() => {
    localStorage.clear();
    resetLogsCache();
  });

  afterEach(() => {
    localStorage.clear();
    resetLogsCache();
  });

  it('returns all-zero frequencies (isReal false) when no data exists', () => {
    const data = computeRpeDistributionData('w1', 1);
    expect(data).toHaveLength(10);
    data.forEach((item) => {
      expect(item.frequency).toBe(0);
      expect(item.isReal).toBe(false);
    });
  });

  it('counts only real RPE values from the requested week', () => {
    localStorage.setItem('nexus_logs_w1d1_a', JSON.stringify([{ rpe: '8' }, { rpe: '8' }]));
    localStorage.setItem('nexus_logs_w1d3_b', JSON.stringify([{ rpe: '6.4' }])); // rounds to 6
    localStorage.setItem('nexus_logs_w2d1_c', JSON.stringify([{ rpe: '10' }])); // other week

    const data = computeRpeDistributionData('w1', 1);
    expect(data[7].frequency).toBe(2); // RPE 8
    expect(data[5].frequency).toBe(1); // RPE 6
    expect(data[9].frequency).toBe(0); // RPE 10 belongs to w2
    expect(data.every((d) => d.isReal)).toBe(true);
  });
});

describe('analyticsService - computeRpeComparisonInfo', () => {
  beforeEach(() => {
    localStorage.clear();
    resetLogsCache();
  });

  afterEach(() => {
    localStorage.clear();
    resetLogsCache();
  });

  it('returns hasComparison false when today has no real logs', () => {
    const info = computeRpeComparisonInfo('w2', 'w2d1', 1);
    expect(info.hasComparison).toBe(false);
    expect(info.hasCurrentReal).toBe(false);
    expect(info.currentAvg).toBeNull();
    expect(info.priorAvg).toBeNull();
  });

  it('returns hasComparison false (but keeps currentAvg) when no other week has the same weekday logged', () => {
    localStorage.setItem('nexus_logs_w2d1_a', JSON.stringify([{ rpe: '8' }]));

    const info = computeRpeComparisonInfo('w2', 'w2d1', 1);
    expect(info.hasComparison).toBe(false);
    expect(info.hasCurrentReal).toBe(true);
    expect(info.currentAvg).toBe(8);
    expect(info.priorAvg).toBeNull();
  });

  it('compares against real same-weekday averages from other weeks only', () => {
    localStorage.setItem('nexus_logs_w2d1_a', JSON.stringify([{ rpe: '9' }]));
    localStorage.setItem('nexus_logs_w1d1_b', JSON.stringify([{ rpe: '7' }, { rpe: '8' }])); // avg 7.5
    localStorage.setItem('nexus_logs_w3d2_c', JSON.stringify([{ rpe: '10' }])); // wrong weekday, ignored

    const info = computeRpeComparisonInfo('w2', 'w2d1', 1);
    expect(info.hasComparison).toBe(true);
    expect(info.currentAvg).toBe(9);
    expect(info.priorAvg).toBe(7.5);
    expect(info.diff).toBe(1.5);
    expect(info.status).toBe('warning');
  });

  it('flags positive adaptation when current RPE is clearly lower', () => {
    localStorage.setItem('nexus_logs_w2d1_a', JSON.stringify([{ rpe: '6' }]));
    localStorage.setItem('nexus_logs_w1d1_b', JSON.stringify([{ rpe: '8' }]));

    const info = computeRpeComparisonInfo('w2', 'w2d1', 1);
    expect(info.hasComparison).toBe(true);
    expect(info.diff).toBe(-2);
    expect(info.status).toBe('good');
  });
});
