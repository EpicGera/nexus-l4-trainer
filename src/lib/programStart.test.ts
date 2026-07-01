import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProgramStartDate,
  setProgramStartDate,
  getProgramTodayPosition,
} from './programStart';
import { getWeekOfProgram } from './constants';

const expectedDayIndex = (d: Date) => (d.getDay() === 0 ? 6 : d.getDay() - 1);

describe('programStart', () => {
  beforeEach(() => localStorage.clear());

  it('persists and clears the start date (ignoring invalid input)', () => {
    expect(getProgramStartDate()).toBeNull();
    setProgramStartDate('2026-06-08');
    expect(getProgramStartDate()).toBe('2026-06-08');
    setProgramStartDate('not-a-date');
    expect(getProgramStartDate()).toBeNull();
  });

  it('falls back to the calendar week when no start date is set', () => {
    const now = new Date('2026-06-23T10:00:00');
    const pos = getProgramTodayPosition(now);
    expect(pos.week).toBe(getWeekOfProgram(now));
    expect(pos.dayIndex).toBe(expectedDayIndex(now));
  });

  it('derives the program week from weeks elapsed on a 4-week cycle', () => {
    setProgramStartDate('2026-06-08'); // a Monday — Semana 1 · Día 1
    const week = (iso: string) => getProgramTodayPosition(new Date(`${iso}T08:00:00`)).week;
    expect(week('2026-06-08')).toBe('w1'); // start day
    expect(week('2026-06-10')).toBe('w1'); // same Mon-anchored week
    expect(week('2026-06-15')).toBe('w2'); // +1 week
    expect(week('2026-06-29')).toBe('w4'); // +3 weeks
    expect(week('2026-07-06')).toBe('w1'); // +4 weeks → wraps the cycle
    expect(week('2026-07-13')).toBe('w2'); // +5 weeks
  });

  it('always reports the real weekday as the day index', () => {
    setProgramStartDate('2026-06-08');
    const tue = new Date('2026-06-09T08:00:00');
    expect(getProgramTodayPosition(tue).dayIndex).toBe(expectedDayIndex(tue));
  });
});
