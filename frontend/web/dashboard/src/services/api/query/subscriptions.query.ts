import { DASHBOARD_API } from "@/config/routes.constant";
import { subscriptionListSchema } from "@/schemas/subscription.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Subscription } from "@/types/plans/subscription.type";

/** One current subscription per brand the owner holds; brands without one are omitted by the backend. */
export function fetchSubscriptions(): Promise<Subscription[]> {
  return apiRequest(`${DASHBOARD_API}/subscription`, { schema: subscriptionListSchema });
}
