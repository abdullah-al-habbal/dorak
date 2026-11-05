import type { IBranchOpeningDay } from "@/services/api/dashboard/branch/types/ibranch-opening-day.types";

/**
 * Wire entries for the days that are configured: closed days and days with
 * both times. Untouched days are left out so a branch without hours stays
 * "always open" (Task 51).
 */
export function openingHoursPayload(days: IBranchOpeningDay[] = []) {
  return days
    .filter(
      (day) =>
        day.isClosed || (day.opensTime !== null && day.closesTime !== null),
    )
    .map((day) => ({
      day_of_week: day.dayOfWeek,
      is_closed: day.isClosed,
      opens_time: day.isClosed ? null : day.opensTime,
      closes_time: day.isClosed ? null : day.closesTime,
    }));
}
