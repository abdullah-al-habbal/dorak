import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { apiRequest } from "@/services/api/core/client";

export async function deletePlan(id: string): Promise<void> {
  await apiRequest(`${DASHBOARD_API}/admin/subscription-plans/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}
