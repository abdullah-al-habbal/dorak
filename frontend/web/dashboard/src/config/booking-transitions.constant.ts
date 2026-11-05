import { BookingStatus } from "@/enums/booking-status.enum";
import type { BookingTarget } from "@/types/booking-target.type";

/** Mirrors BookingStatus::canTransitionTo. `pending` is never a target. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingTarget[]> = {
  [BookingStatus.Pending]: [BookingStatus.Confirmed, BookingStatus.Cancelled],
  [BookingStatus.Confirmed]: [BookingStatus.InProgress, BookingStatus.Cancelled, BookingStatus.NoShow],
  [BookingStatus.InProgress]: [BookingStatus.Completed, BookingStatus.Cancelled, BookingStatus.NoShow],
  [BookingStatus.Completed]: [],
  [BookingStatus.Cancelled]: [],
  [BookingStatus.NoShow]: [],
};

export const DESTRUCTIVE_TRANSITIONS: readonly BookingTarget[] = [BookingStatus.Cancelled, BookingStatus.NoShow];
