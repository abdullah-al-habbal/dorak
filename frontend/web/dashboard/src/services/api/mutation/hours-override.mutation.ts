import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { hoursOverrideSchema } from "@/schemas/hours-override.zod";
import { apiRequest } from "@/services/api/core/client";
import type { HoursOverride, HoursOverrideInput } from "@/types/hours/hours-override.type";

function overridePath(branchId: string, date: string): string {
  return `${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/hours-overrides/${encodeURIComponent(date)}`;
}

export function setHoursOverride(branchId: string, date: string, input: HoursOverrideInput): Promise<HoursOverride> {
  return apiRequest(overridePath(branchId, date), { method: HttpMethod.Put, body: input, schema: hoursOverrideSchema });
}

export async function clearHoursOverride(branchId: string, date: string): Promise<void> {
  await apiRequest(overridePath(branchId, date), { method: HttpMethod.Delete, schema: z.unknown() });
}
