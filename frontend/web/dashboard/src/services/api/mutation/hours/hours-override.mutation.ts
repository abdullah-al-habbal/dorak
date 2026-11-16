import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { hoursOverrideListSchema, hoursOverrideSchema } from "@/schemas/hours/hours-override.zod";
import { apiRequest } from "@/services/api/core/client";
import type { HoursOverride, HoursOverrideInput, HoursOverrideRangeInput } from "@/types/hours/hours-override.type";

function overridePath(branchId: string, date: string): string {
  return `${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/hours-overrides/${encodeURIComponent(date)}`;
}

export function setHoursOverride(branchId: string, date: string, input: HoursOverrideInput): Promise<HoursOverride> {
  return apiRequest(overridePath(branchId, date), { method: HttpMethod.Put, body: input, schema: hoursOverrideSchema });
}

/** One exception for every day of a range, or only some weekdays of it; the backend answers with the saved days. */
export function setHoursOverrideRange(branchId: string, input: HoursOverrideRangeInput): Promise<HoursOverride[]> {
  return apiRequest(`${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/hours-overrides`, { method: HttpMethod.Put, body: input, schema: hoursOverrideListSchema });
}

export async function clearHoursOverride(branchId: string, date: string): Promise<void> {
  await apiRequest(overridePath(branchId, date), { method: HttpMethod.Delete, schema: z.unknown() });
}
