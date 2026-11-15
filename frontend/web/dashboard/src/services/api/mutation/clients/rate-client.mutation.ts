import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { apiRequest } from "@/services/api/core/client";
import type { ClientRatingInput } from "@/types/clients/clients/client-rating.type";

export function rateClient(bookingId: string, input: ClientRatingInput): Promise<unknown> {
  return apiRequest(`${DASHBOARD_API}/bookings/${encodeURIComponent(bookingId)}/review`, { method: HttpMethod.Post, body: input, schema: z.unknown() });
}
