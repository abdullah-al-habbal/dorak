import type { BookingStatus } from "@/enums/booking/booking-status.enum";
import type { ScheduleRange } from "@/enums/booking/schedule-range.enum";

export interface ScheduleFilters {
  range: ScheduleRange;
  status?: BookingStatus;
  page: number;
}
