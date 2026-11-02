import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";

export const BOOKING_LIST_FILTER_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "no_show",
  "cancelled",
];
