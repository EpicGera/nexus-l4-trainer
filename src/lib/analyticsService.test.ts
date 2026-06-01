import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { computeChartData } from './analyticsService';

describe('analyticsService - computeChartData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return baseline values when no data exists', () => {
    const data = computeChartData('w1', 1);
    expect(data).toHaveLength(7);

    expect(data[0]).toEqual({ name: 'LUN', rpe: 7.5, isReal: false });
    expect(data[1]).toEqual({ name: 'MAR', rpe: 6.0, isReal: false });
    expect(data[2]).toEqual({ name: 'MIÉ', rpe: 8.0, isReal: false });
    expect(data[3]).toEqual({ name: 'JUE', rpe: 7.0, isReal: false });
    expect(data[4]).toEqual({ name: 'VIE', rpe: 3.5, isReal: false });
    expect(data[5]).toEqual({ name: 'SÁB', rpe: 8.5, isReal: false });
    expect(data[6]).toEqual({ name: 'DOM', rpe: 7.2, isReal: false });
  });

  it('should compute average RPE for a day with valid logs', () => {
    // Week w1, Day 1 (Monday)
    localStorage.setItem('nexus_logs_w1d1_1', JSON.stringify([
      { rpe: '8' },
      { rpe: '6' }
    ]));

    const data = computeChartData('w1', 1);
    expect(data[0]).toEqual({ name: 'LUN', rpe: 7.0, isReal: true });

    // Other days should remain baseline
    expect(data[1].isReal).toBe(false);
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

  it('should fallback to baseline if logs exist but have no valid RPEs', () => {
    localStorage.setItem('nexus_logs_w1d1_1', JSON.stringify([
      { rpe: 'invalid' },
      { rpe: '-2' }
    ]));

    const data = computeChartData('w1', 1);
    expect(data[0]).toEqual({ name: 'LUN', rpe: 7.5, isReal: false });
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
    expect(data[0].rpe).toBe(7.5); // baseline for Monday
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
