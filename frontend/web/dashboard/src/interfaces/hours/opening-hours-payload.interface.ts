import type { Weekday } from "@/enums/booking/weekday.enum";
import type { Shift } from "@/interfaces/hours/shift.interface";

export interface OpeningHoursPayloadDay {
  day_of_week: Weekday;
  is_closed?: true;
  shifts?: Shift[];
}

export interface OpeningHoursPayload {
  hours: OpeningHoursPayloadDay[];
}
