import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";
import { BOOKING_STATUS_TRANSITIONS } from "@/services/api/dashboard/booking/booking-status-transitions.constant";

type NonPendingStatus = Exclude<BookingStatus, "pending">;

/**
 * Mirrors the backend's `BookingStatus::canTransitionTo` matrix
 * (backend/modules/Booking/Enums/BookingStatus.php) so the status selector
 * never offers a transition the backend would reject with 422. No booking
 * can be set back to `pending` from the dashboard, so it never appears here.
 */
export function allowedNextBookingStatuses(
  status: BookingStatus,
): NonPendingStatus[] {
  return BOOKING_STATUS_TRANSITIONS[status];
}

export function isTerminalBookingStatus(status: BookingStatus): boolean {
  return BOOKING_STATUS_TRANSITIONS[status].length === 0;
}
