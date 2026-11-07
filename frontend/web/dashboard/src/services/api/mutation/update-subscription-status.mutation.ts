import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { SubscriptionStatus } from "@/enums/subscription-status.enum";
import { adminSubscriptionSchema } from "@/schemas/admin-subscription.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminSubscription } from "@/types/admin-subscription.type";

export interface UpdateSubscriptionStatusVariables {
  id: string;
  status: SubscriptionStatus;
}

export function updateSubscriptionStatus({ id, status }: UpdateSubscriptionStatusVariables): Promise<AdminSubscription> {
  return apiRequest(`${DASHBOARD_API}/admin/subscriptions/${encodeURIComponent(id)}/status`, { method: HttpMethod.Patch, body: { status }, schema: adminSubscriptionSchema });
}
