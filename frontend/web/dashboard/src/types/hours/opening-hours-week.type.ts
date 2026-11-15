import type { OpeningHoursDay } from "@/interfaces/hours/opening-hours-day.interface";

/** Seven days indexed by `Weekday`, so `week[Weekday.Monday]` is Monday. */
export type OpeningHoursWeek = readonly OpeningHoursDay[];
