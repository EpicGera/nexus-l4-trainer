// Program calendar anchor. The athlete sets the date they started
// "Acto I · Semana 1 · Día 1"; from there "ACOPLAR HOY" derives the real
// program week + day for today instead of guessing from the calendar week.
import { getWeekOfProgram } from "./constants";

const KEY = "nexus_program_start_date";
const CYCLE_WEEKS = 4; // the program repeats on a 4-week cycle (w1..w4)
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

/** ISO date (YYYY-MM-DD) the athlete started the program, or null if unset. */
export function getProgramStartDate(): string | null {
  try {
    const s = localStorage.getItem(KEY);
    return s && ISO_RE.test(s) ? s : null;
  } catch {
    return null;
  }
}

/** Persist (or clear, when passed null/invalid) the program start date. */
export function setProgramStartDate(iso: string | null): void {
  try {
    if (iso && ISO_RE.test(iso)) localStorage.setItem(KEY, iso);
    else localStorage.removeItem(KEY);
  } catch {
    /* localStorage unavailable — ignore */
  }
}

// Monday (local) of the week containing `d`, at 00:00. Anchoring to Monday keeps
// week boundaries aligned with the L-M-M-J-V-S board layout.
function mondayOf(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = (x.getDay() + 6) % 7; // Mon=0 … Sun=6
  x.setDate(x.getDate() - wd);
  return x;
}

/**
 * Anchor the cycle: today's week becomes "Semana 1". Called when a chapter is
 * created so auto-follow tracks the REAL program position instead of the
 * calendar week; the athlete can still adjust the date in the profile.
 */
export function anchorProgramStartToCurrentWeek(now: Date = new Date()): void {
  const mon = mondayOf(now);
  const iso = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(
    mon.getDate(),
  ).padStart(2, "0")}`;
  setProgramStartDate(iso);
}

/**
 * The program week + day index for `now`.
 * - Week: when a start date is set, derived from full weeks elapsed since the
 *   start week's Monday, wrapped over the 4-week cycle; otherwise it falls back
 *   to the legacy calendar-based week so nothing breaks for users who never set it.
 * - Day index: always the real weekday (Mon=0 … Sun=6) so the board lands on
 *   today's column.
 */
export function getProgramTodayPosition(
  now: Date = new Date(),
): { week: string; dayIndex: number } {
  const jsDay = now.getDay();
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Mon→0 … Sun→6

  const startIso = getProgramStartDate();
  if (!startIso) return { week: getWeekOfProgram(now), dayIndex };

  const start = new Date(`${startIso}T00:00:00`);
  if (isNaN(start.getTime())) return { week: getWeekOfProgram(now), dayIndex };

  const ms = mondayOf(now).getTime() - mondayOf(start).getTime();
  const weeksElapsed = Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
  const w = (((weeksElapsed % CYCLE_WEEKS) + CYCLE_WEEKS) % CYCLE_WEEKS) + 1;
  return { week: `w${w}`, dayIndex };
}
