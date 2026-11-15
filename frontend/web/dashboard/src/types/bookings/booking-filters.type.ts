import type { BookingStatus } from "@/enums/booking-status.enum";
import type { BookingView } from "@/enums/booking-view.enum";

export interface BookingFilters {
  view: BookingView;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  status?: BookingStatus;
  chairId?: string;
  search?: string;
  hideCancelled?: boolean;
  page: number;
}
