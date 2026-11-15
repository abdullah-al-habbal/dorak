import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { adminPayoutListSchema } from "@/schemas/earnings/admin-payout.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";

/** Groups the unsettled commission entries into draft payouts; resolves to the drafts it created. */
export function generatePayouts(): Promise<AdminPayout[]> {
  return apiRequest(`${DASHBOARD_API}/admin/payouts/generate`, { method: HttpMethod.Post, schema: adminPayoutListSchema });
}
