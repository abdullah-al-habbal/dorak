import { BookingStatus } from "@/enums/booking/booking-status.enum";
import type { BookingTarget } from "@/types/bookings/booking-target.type";

/** Mirrors BookingStatus::canTransitionTo. `pending` is never a target. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingTarget[]> = {
  [BookingStatus.Pending]: [BookingStatus.Confirmed, BookingStatus.Cancelled],
  [BookingStatus.Confirmed]: [BookingStatus.InProgress, BookingStatus.Cancelled, BookingStatus.NoShow],
  [BookingStatus.InProgress]: [BookingStatus.Completed, BookingStatus.Cancelled, BookingStatus.NoShow],
  [BookingStatus.Completed]: [],
  [BookingStatus.Cancelled]: [],
  [BookingStatus.NoShow]: [],
};

/** Mirrors RescheduleBookingEloquentResolver: only open bookings can move. */
export const RESCHEDULABLE_STATUSES: readonly BookingStatus[] = [BookingStatus.Pending, BookingStatus.Confirmed];

export const DESTRUCTIVE_TRANSITIONS: readonly BookingTarget[] = [BookingStatus.Cancelled, BookingStatus.NoShow];
