import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { WalkInPayload } from "@/interfaces/walk-in-payload.interface";
import { bookingSchema } from "@/schemas/booking.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Booking } from "@/types/booking.type";

export function createWalkIn(payload: WalkInPayload): Promise<Booking> {
  return apiRequest(`${DASHBOARD_API}/bookings/walk-in`, { method: HttpMethod.Post, body: payload, schema: bookingSchema });
}
