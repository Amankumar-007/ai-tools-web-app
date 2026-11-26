/**
 * Calendar maths on plain dates ("YYYY-MM-DD"), done in UTC so time zones and daylight saving can never shift a day.
 * Callers pass "today" in explicitly (from the user's own clock) so everything here is deterministic.
 */

export interface YMD { y: number; m: number; d: number }
export interface Duration { years: number; months: number; days: number }

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2200;
const DAY_MS = 86_400_000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const toUtc = (p: YMD) => Date.UTC(p.y, p.m - 1, p.d);
export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Strict parse: rejects 2024-02-30, 2024-13-01, and years outside 1900–2200. */
export function parseDate(text: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return null;
  const p = { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  if (p.y < MIN_YEAR || p.y > MAX_YEAR || p.m < 1 || p.m > 12 || p.d < 1 || p.d > daysInMonth(p.y, p.m)) return null;
  return p;
}

export const formatDate = (p: YMD) => `${String(p.y).padStart(4, '0')}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
export const compareDates = (a: YMD, b: YMD) => toUtc(a) - toUtc(b);
export const weekdayName = (p: YMD) => WEEKDAYS[new Date(toUtc(p)).getUTCDay()];

export function daysBetween(a: YMD, b: YMD): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY_MS);
}

/** Move a date by whole months; the day clamps to the end of a shorter month (31 Jan + 1 month = 29 Feb in a leap year). */
function addMonthsClamped(p: YMD, months: number): YMD {
  const total = p.y * 12 + (p.m - 1) + months;
  const y = Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12 + 1;
  return { y, m, d: Math.min(p.d, daysInMonth(y, m)) };
}

/**
 * Years, months and days from `from` to `to` (to must not be before from): the largest whole number of months that
 * still lands on or before `to`, then the leftover days. This stays correct when the start day does not exist in
 * the end month (e.g. 31 Jan to 1 Mar is 1 month and 1 day).
 */
export function durationBetween(from: YMD, to: YMD): Duration {
  if (compareDates(from, to) > 0) throw new RangeError('The end date is before the start date.');
  let months = (to.y - from.y) * 12 + (to.m - from.m);
  if (compareDates(addMonthsClamped(from, months), to) > 0) months -= 1;
  const days = daysBetween(addMonthsClamped(from, months), to);
  return { years: Math.floor(months / 12), months: months % 12, days };
}

export interface AgeResult {
  age: Duration;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  bornOn: string;
  nextBirthday: { date: YMD; daysUntil: number; turning: number; weekday: string };
}

/** Feb 29 birthdays are celebrated on Mar 1 in years that have no Feb 29. */
function birthdayInYear(dob: YMD, year: number): YMD {
  if (dob.m === 2 && dob.d === 29 && daysInMonth(year, 2) === 28) return { y: year, m: 3, d: 1 };
  return { y: year, m: dob.m, d: dob.d };
}

export function ageOn(dob: YMD, today: YMD): AgeResult {
  if (compareDates(dob, today) > 0) throw new RangeError('Date of birth is in the future.');
  const age = durationBetween(dob, today);
  let next = birthdayInYear(dob, today.y);
  if (compareDates(next, today) <= 0) next = birthdayInYear(dob, today.y + 1);
  return {
    age,
    totalDays: daysBetween(dob, today),
    totalWeeks: Math.floor(daysBetween(dob, today) / 7),
    totalMonths: age.years * 12 + age.months,
    bornOn: weekdayName(dob),
    nextBirthday: { date: next, daysUntil: daysBetween(today, next), turning: next.y - dob.y, weekday: weekdayName(next) },
  };
}

export interface DiffResult { days: number; weeks: number; remainderDays: number; duration: Duration; weekdays: number; swapped: boolean }

/** Working days = Monday to Friday from the start date up to (not including) the end date. Public holidays are not known. */
export function dateDifference(a: YMD, b: YMD): DiffResult {
  const swapped = compareDates(a, b) > 0;
  const [from, to] = swapped ? [b, a] : [a, b];
  const days = daysBetween(from, to);
  let weekdays = 0;
  const fullWeeks = Math.floor(days / 7);
  weekdays += fullWeeks * 5;
  const startDow = new Date(toUtc(from)).getUTCDay();
  for (let i = 0; i < days % 7; i++) { const dow = (startDow + i) % 7; if (dow !== 0 && dow !== 6) weekdays++; }
  return { days, weeks: Math.floor(days / 7), remainderDays: days % 7, duration: durationBetween(from, to), weekdays, swapped };
}

/** Add (sign 1) or subtract (sign -1) years, months and days. Month ends clamp: 31 Jan + 1 month = 28/29 Feb. */
export function shiftDate(start: YMD, delta: Duration, sign: 1 | -1): YMD {
  const totalMonths = start.y * 12 + (start.m - 1) + sign * (delta.years * 12 + delta.months);
  const y = Math.floor(totalMonths / 12);
  const m = (totalMonths % 12 + 12) % 12 + 1;
  const d = Math.min(start.d, daysInMonth(y, m));
  const shifted = new Date(Date.UTC(y, m - 1, d) + sign * delta.days * DAY_MS);
  const result = { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() };
  if (result.y < MIN_YEAR || result.y > MAX_YEAR) throw new RangeError(`The result is outside ${MIN_YEAR}–${MAX_YEAR}.`);
  return result;
}

export function todayLocal(now: Date = new Date()): YMD {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}
