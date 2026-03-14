/**
 * Shared formatters for display.
 */

export function formatMeetingTime(date: Date | string) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatOutcome(outcome: string) {
  return outcome
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type MonthWithData = { year: number; month: number };

export function formatMonthOption(m: MonthWithData) {
  return `${MONTH_NAMES[m.month - 1]} ${m.year}`;
}
