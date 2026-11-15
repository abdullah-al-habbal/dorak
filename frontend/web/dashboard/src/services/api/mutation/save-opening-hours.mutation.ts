import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { OpeningHoursDay } from "@/interfaces/hours/opening-hours-day.interface";
import type { OpeningHoursPayload } from "@/interfaces/hours/opening-hours-payload.interface";
import { openingHoursSchema } from "@/schemas/opening-hours.zod";
import { apiRequest } from "@/services/api/core/client";

export async function saveOpeningHours(branchId: string, payload: OpeningHoursPayload): Promise<OpeningHoursDay[]> {
  const data = await apiRequest(`${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/opening-hours`, {
    method: HttpMethod.Put,
    body: payload,
    schema: openingHoursSchema,
  });
  return data.opening_hours;
}
