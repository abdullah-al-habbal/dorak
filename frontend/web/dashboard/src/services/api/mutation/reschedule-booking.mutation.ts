import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { ReschedulePayload } from "@/interfaces/bookings/reschedule-payload.interface";
import { bookingSchema } from "@/schemas/booking.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Booking } from "@/types/bookings/booking.type";

export function rescheduleBooking(id: string, payload: ReschedulePayload): Promise<Booking> {
  return apiRequest(`${DASHBOARD_API}/bookings/${encodeURIComponent(id)}/reschedule`, {
    method: HttpMethod.Patch,
    body: payload,
    schema: bookingSchema,
  });
}
