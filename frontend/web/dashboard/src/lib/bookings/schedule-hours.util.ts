import { SCHEDULE_DAYS_IN_WEEK } from "@/config/ops/schedule.constant";
import type { Weekday } from "@/enums/booking/weekday.enum";
import type { ScheduleHoursDay } from "@/interfaces/bookings/schedule-hours-day.interface";
import type { ScheduleHoursRow } from "@/types/bookings/schedule-hours-row.type";

const TIME_PATTERN = /^(\d{1,2}):(\d{2})/;

/** Seven days starting at `weekStart`; inactive rows are dropped, so an empty `shifts` means a day off. */
export function scheduleWeek(rows: readonly ScheduleHoursRow[], weekStart: number): ScheduleHoursDay[] {
  return Array.from({ length: SCHEDULE_DAYS_IN_WEEK }, (_, offset) => {
    const day = ((weekStart + offset) % SCHEDULE_DAYS_IN_WEEK) as Weekday;
    const shifts = rows
      .filter((row) => row.day_of_week === day && row.is_active)
      .map((row) => ({ start: row.start_time, end: row.end_time }))
      .sort((a, b) => a.start.localeCompare(b.start));
    return { day, shifts };
  });
}

/** `09:00` as a locale clock time (Arabic digits and 12/24-hour follow the locale); falls back to the raw text. */
export function formatClock(time: string, locale: string): string {
  const match = TIME_PATTERN.exec(time);
  if (!match) return time;
  const date = new Date(2023, 0, 1, Number(match[1]), Number(match[2]));
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
}
