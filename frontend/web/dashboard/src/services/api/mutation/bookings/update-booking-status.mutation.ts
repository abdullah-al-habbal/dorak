import { DASHBOARD_API } from "@/config/routes.constant";
import { BookingStatus } from "@/enums/booking/booking-status.enum";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { bookingSchema } from "@/schemas/bookings/booking.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Booking } from "@/types/bookings/booking.type";
import type { BookingTarget } from "@/types/bookings/booking-target.type";

/** Cancelling has its own route; every other transition is a status PATCH. */
export function updateBookingStatus(id: string, target: BookingTarget): Promise<Booking> {
  const path = `${DASHBOARD_API}/bookings/${encodeURIComponent(id)}`;
  if (target === BookingStatus.Cancelled) {
    return apiRequest(`${path}/cancel`, { method: HttpMethod.Patch, schema: bookingSchema });
  }
  return apiRequest(path, { method: HttpMethod.Patch, body: { booking_status: target }, schema: bookingSchema });
}
