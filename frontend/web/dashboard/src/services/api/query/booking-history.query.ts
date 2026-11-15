import { DASHBOARD_API } from "@/config/routes.constant";
import { bookingHistorySchema } from "@/schemas/bookings/booking-history.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BookingHistoryEntry } from "@/types/bookings/booking-history-entry.type";

export function fetchBookingHistory(id: string): Promise<BookingHistoryEntry[]> {
  return apiRequest(`${DASHBOARD_API}/bookings/${encodeURIComponent(id)}/history`, { schema: bookingHistorySchema });
}
