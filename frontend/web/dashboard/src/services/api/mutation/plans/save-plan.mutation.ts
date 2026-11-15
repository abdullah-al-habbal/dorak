import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import type { PlanPayload } from "@/interfaces/plans/plan-payload.interface";
import { planSchema } from "@/schemas/plans/plan.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Plan } from "@/types/plans/plan.type";

const PLANS = `${DASHBOARD_API}/admin/subscription-plans`;

export function createPlan(payload: PlanPayload): Promise<Plan> {
  return apiRequest(PLANS, { method: HttpMethod.Post, body: payload, schema: planSchema });
}

export function updatePlan(id: string, payload: PlanPayload): Promise<Plan> {
  return apiRequest(`${PLANS}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: planSchema });
}
