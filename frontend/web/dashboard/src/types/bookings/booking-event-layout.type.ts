import type { Booking } from "@/types/bookings/booking.type";

export interface BookingEventLayout {
  booking: Booking;
  /** Minutes from the start of the day, clipped to the day. */
  startMinute: number;
  endMinute: number;
  column: number;
  columns: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}
