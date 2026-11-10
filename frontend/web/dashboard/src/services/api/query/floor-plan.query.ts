import { DASHBOARD_API } from "@/config/routes.constant";
import { floorPlanSchema } from "@/schemas/floor-plan.zod";
import { apiRequest } from "@/services/api/core/client";
import type { FloorPlan } from "@/types/floor-plan.type";

export function fetchFloorPlan(branchId: string): Promise<FloorPlan> {
  return apiRequest(`${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/floor-plan`, { schema: floorPlanSchema });
}
