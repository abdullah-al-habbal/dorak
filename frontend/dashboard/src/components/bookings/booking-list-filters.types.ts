import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";

export interface IBookingListFiltersValue {
  status: BookingStatus | "";
  dateFrom: string;
  dateTo: string;
  chairId: string;
  stylistId: string;
}
