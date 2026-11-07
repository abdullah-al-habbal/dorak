import { DASHBOARD_API } from "@/config/routes.constant";
import { planFeatureKeysSchema } from "@/schemas/plan.zod";
import { apiRequest } from "@/services/api/core/client";

export function fetchPlanFeatureKeys(): Promise<string[]> {
  return apiRequest(`${DASHBOARD_API}/admin/plan-feature-keys`, { schema: planFeatureKeysSchema });
}
