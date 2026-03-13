/**
 * Norwegian working days calculation.
 * Excludes weekends (Sat/Sun) and Norwegian public holidays.
 *
 * Norwegian public holidays:
 * - Fixed: Jan 1, May 1, May 17, Dec 25, Dec 26
 * - Moveable (Easter-based): Maundy Thursday, Good Friday, Easter Sunday,
 *   Easter Monday, Ascension Day (39 days after Easter), Whit Sunday (49 days),
 *   Whit Monday (50 days)
 */

/** Returns Easter Sunday as a Date for the given year (Gregorian calendar). */
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Returns all Norwegian public holidays for a given year. */
function getNorwegianHolidays(year: number): Date[] {
  const easter = getEasterSunday(year);
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };

  return [
    new Date(year, 0, 1), // New Year's Day
    addDays(easter, -3), // Maundy Thursday
    addDays(easter, -2), // Good Friday
    addDays(easter, 0), // Easter Sunday
    addDays(easter, 1), // Easter Monday
    new Date(year, 4, 1), // May 1 - Labour Day
    new Date(year, 4, 17), // Constitution Day
    addDays(easter, 39), // Ascension Day
    addDays(easter, 49), // Whit Sunday
    addDays(easter, 50), // Whit Monday
    new Date(year, 11, 25), // Christmas Day
    new Date(year, 11, 26), // Boxing Day
  ];
}

/** Normalize date to YYYY-MM-DD for comparison. */
function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Check if a date is a Norwegian public holiday. */
export function isNorwegianHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = getNorwegianHolidays(year);
  const key = toDateKey(date);
  return holidays.some((h) => toDateKey(h) === key);
}

/** Check if a date is a weekend (Saturday or Sunday). */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Check if a date is a Norwegian working day (Mon–Fri, excluding holidays). */
export function isNorwegianWorkingDay(date: Date): boolean {
  if (isWeekend(date)) return false;
  if (isNorwegianHoliday(date)) return false;
  return true;
}

/** Get Monday of the week containing the given date (ISO week, Mon–Sun). */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return d;
}

/**
 * Get the number of Norwegian working days in the week containing the given date.
 * (Monday through Friday, excluding holidays)
 */
export function getWorkingDaysInWeek(date: Date): number {
  const monday = getMondayOfWeek(date);
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (isNorwegianWorkingDay(d)) count++;
  }
  return count;
}

/**
 * Get the number of Norwegian working days elapsed in the week up to and including the given date.
 * (Monday = 1, Tuesday = 2, ..., or 0 if weekend before any work day)
 */
export function getWorkDaysElapsedInWeek(date: Date): number {
  const monday = getMondayOfWeek(date);
  const dateKey = toDateKey(date);

  let count = 0;
  const d = new Date(monday);
  for (let i = 0; i < 7; i++) {
    d.setDate(monday.getDate() + i);
    const key = toDateKey(d);
    if (key > dateKey) break;
    if (isNorwegianWorkingDay(d)) count++;
  }
  return count;
}
