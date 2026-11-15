import type { Booking } from "@/types/bookings/booking.type";
import type { PageInfo } from "@/types/core/shared/page-info.type";

export interface BookingPage {
  items: Booking[];
  page: PageInfo;
}
