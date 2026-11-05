import { DASHBOARD_API } from "@/config/routes.constant";
import type { OpeningHoursDay } from "@/interfaces/opening-hours-day.interface";
import { openingHoursSchema } from "@/schemas/opening-hours.zod";
import { apiRequest } from "@/services/api/core/client";

export async function fetchOpeningHours(branchId: string): Promise<OpeningHoursDay[]> {
  const data = await apiRequest(`${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/opening-hours`, { schema: openingHoursSchema });
  return data.opening_hours;
}
