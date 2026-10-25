import { BRANCH_WEEKDAYS } from "@/services/api/dashboard/branch/branch-opening-hours.constant";
import type { IBranchOpeningDay } from "@/services/api/dashboard/branch/types/ibranch-opening-day.types";

/** Seven rows (Sunday = 0), filling days the branch has not configured. */
export function fullWeek(days: IBranchOpeningDay[] = []): IBranchOpeningDay[] {
  return BRANCH_WEEKDAYS.map(
    (weekday) =>
      days.find((day) => day.weekday === weekday) ?? {
        weekday,
        isClosed: false,
        opensAt: null,
        closesAt: null,
      },
  );
}

/**
 * Wire entries for the days that are configured: closed days and days with
 * both times. Untouched days are left out so a branch without hours stays
 * "always open" (Task 51).
 */
export function openingHoursPayload(days: IBranchOpeningDay[] = []) {
  return days
    .filter(
      (day) => day.isClosed || (day.opensAt !== null && day.closesAt !== null),
    )
    .map((day) => ({
      weekday: day.weekday,
      is_closed: day.isClosed,
      opens_at: day.isClosed ? null : day.opensAt,
      closes_at: day.isClosed ? null : day.closesAt,
    }));
}
