import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";

type NonPendingStatus = Exclude<BookingStatus, "pending">;

/**
 * Mirrors the backend's `BookingStatus::canTransitionTo` matrix
 * (backend/modules/Booking/Enums/BookingStatus.php) so the status selector
 * never offers a transition the backend would reject with 422. No booking
 * can be set back to `pending` from the dashboard, so it never appears here.
 */
const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, NonPendingStatus[]> = {
  pending: ["confirmed", "canceled"],
  confirmed: ["in_progress", "canceled", "no_show"],
  ["in_progress"]: ["completed", "canceled", "no_show"],
  completed: [],
  canceled: [],
  ["no_show"]: [],
};

export function allowedNextBookingStatuses(
  status: BookingStatus,
): NonPendingStatus[] {
  return BOOKING_STATUS_TRANSITIONS[status];
}

export function isTerminalBookingStatus(status: BookingStatus): boolean {
  return BOOKING_STATUS_TRANSITIONS[status].length === 0;
}
