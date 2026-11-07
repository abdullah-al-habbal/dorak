import type { BookingStatus } from "@/enums/booking-status.enum";
import type { ScheduleRange } from "@/enums/schedule-range.enum";

export interface ScheduleFilters {
  range: ScheduleRange;
  status?: BookingStatus;
  page: number;
}
