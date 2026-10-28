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
