import type { Weekday } from "@/enums/booking/weekday.enum";
import type { Shift } from "@/interfaces/hours/shift.interface";

export interface OpeningHoursDay {
  day_of_week: Weekday;
  is_closed: boolean;
  /** Empty when the day is closed. */
  shifts: Shift[];
}
