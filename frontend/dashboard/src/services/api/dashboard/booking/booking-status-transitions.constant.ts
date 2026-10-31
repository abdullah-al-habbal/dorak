import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";

type NonPendingStatus = Exclude<BookingStatus, "pending">;

export const BOOKING_STATUS_TRANSITIONS: Record<
  BookingStatus,
  NonPendingStatus[]
> = {
  pending: ["confirmed", "canceled"],
  confirmed: ["in_progress", "canceled", "no_show"],
  ["in_progress"]: ["completed", "canceled", "no_show"],
  completed: [],
  canceled: [],
  ["no_show"]: [],
};
