import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";

type NonPendingStatus = Exclude<BookingStatus, "pending">;

export const BOOKING_STATUS_TRANSITIONS: Record<
  BookingStatus,
  NonPendingStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled", "no_show"],
  ["in_progress"]: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  ["no_show"]: [],
};
