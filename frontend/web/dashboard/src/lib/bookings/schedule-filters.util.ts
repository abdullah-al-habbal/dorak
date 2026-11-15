import { SCHEDULE_DAYS_IN_WEEK, SCHEDULE_DEFAULT_RANGE, SCHEDULE_RANGES } from "@/config/ops/schedule.constant";
import { BookingStatus } from "@/enums/booking/booking-status.enum";
import { ScheduleRange } from "@/enums/booking/schedule-range.enum";
import { addDays, startOfWeek, toDateKey } from "@/lib/bookings/booking-date.util";
import type { ScheduleFilters } from "@/types/bookings/schedule-filters.type";
import type { ScheduleWindow } from "@/types/bookings/schedule-window.type";

const STATUSES = new Set<string>(Object.values(BookingStatus));
const RANGES = new Set<string>(SCHEDULE_RANGES);

export function scheduleFiltersFromParams(params: URLSearchParams): ScheduleFilters {
  const page = Number(params.get("page"));
  const range = params.get("range") ?? "";
  const status = params.get("status") ?? "";
  return {
    range: RANGES.has(range) ? (range as ScheduleRange) : SCHEDULE_DEFAULT_RANGE,
    status: STATUSES.has(status) ? (status as BookingStatus) : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Defaults stay out of the URL so the plain route is the canonical one. */
export function scheduleFiltersToParams(filters: ScheduleFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.range !== SCHEDULE_DEFAULT_RANGE) params.set("range", filters.range);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** Calendar days in the viewer's zone; `weekStart` is 0 (Sunday) to 6 (Saturday). */
export function scheduleWindow(range: ScheduleRange, now: Date, weekStart: number): ScheduleWindow {
  const today = toDateKey(now);
  if (range === ScheduleRange.Today) return { from: today, to: today };
  if (range === ScheduleRange.Week) {
    const first = startOfWeek(now, weekStart);
    return { from: toDateKey(first), to: toDateKey(addDays(first, SCHEDULE_DAYS_IN_WEEK - 1)) };
  }
  return { from: today };
}
