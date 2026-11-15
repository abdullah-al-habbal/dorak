import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { apiRequest } from "@/services/api/core/client";

export async function deleteChair(id: string): Promise<void> {
  await apiRequest(`${DASHBOARD_API}/chairs/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}
