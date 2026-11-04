import type { Booking } from "@/types/booking.type";
import type { PageInfo } from "@/types/page-info.type";

export interface BookingPage {
  items: Booking[];
  page: PageInfo;
}
