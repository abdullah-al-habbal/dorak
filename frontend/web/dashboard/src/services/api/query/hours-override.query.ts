import { DASHBOARD_API } from "@/config/routes.constant";
import { hoursOverrideListSchema } from "@/schemas/hours/hours-override.zod";
import { apiRequest } from "@/services/api/core/client";
import type { HoursOverride } from "@/types/hours/hours-override.type";

export function fetchHoursOverrides(branchId: string): Promise<HoursOverride[]> {
  return apiRequest(`${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/hours-overrides`, { schema: hoursOverrideListSchema });
}
