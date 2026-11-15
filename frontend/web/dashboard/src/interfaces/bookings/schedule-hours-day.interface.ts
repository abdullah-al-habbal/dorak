import type { Weekday } from "@/enums/booking/weekday.enum";

export interface ScheduleShift {
  start: string;
  end: string;
}

/** One weekday of the barber's weekly hours; `shifts` holds only the active ones. */
export interface ScheduleHoursDay {
  day: Weekday;
  shifts: ScheduleShift[];
}
