import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { PayoutTransitionPayload } from "@/interfaces/earnings/payout-transition-payload.interface";
import { adminPayoutSchema } from "@/schemas/admin-payout.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";

export function transitionPayout({ id, action, ...body }: PayoutTransitionPayload): Promise<AdminPayout> {
  return apiRequest(`${DASHBOARD_API}/admin/payouts/${encodeURIComponent(id)}/${action}`, { method: HttpMethod.Patch, body, schema: adminPayoutSchema });
}
