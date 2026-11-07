import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { adminSubscriptionSchema } from "@/schemas/admin-subscription.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminSubscription } from "@/types/admin-subscription.type";

export interface AssignSubscriptionVariables {
  brand_id: string;
  plan_id: string;
}

export function assignSubscription(variables: AssignSubscriptionVariables): Promise<AdminSubscription> {
  return apiRequest(`${DASHBOARD_API}/admin/subscriptions`, { method: HttpMethod.Post, body: variables, schema: adminSubscriptionSchema });
}
