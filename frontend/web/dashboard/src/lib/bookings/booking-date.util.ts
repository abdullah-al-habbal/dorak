const MS_PER_MINUTE = 60_000;
const DAYS_PER_WEEK = 7;

export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return toDateKey(date) === key ? date : null;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Week start is a locale preference; Saturday-first locales pass 6, Sunday 0, Monday 1. */
export function startOfWeek(date: Date, weekStart: number): Date {
  const offset = (date.getDay() - weekStart + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  return addDays(date, -offset);
}

export function minutesBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_MINUTE);
}
