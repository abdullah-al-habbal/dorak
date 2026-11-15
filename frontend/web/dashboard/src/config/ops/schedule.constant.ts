import { ScheduleRange } from "@/enums/booking/schedule-range.enum";

export const SCHEDULE_PER_PAGE = 15;
export const SCHEDULE_DEFAULT_RANGE = ScheduleRange.Upcoming;
export const SCHEDULE_RANGES: readonly ScheduleRange[] = [ScheduleRange.Today, ScheduleRange.Week, ScheduleRange.Upcoming];
export const SCHEDULE_DAYS_IN_WEEK = 7;
