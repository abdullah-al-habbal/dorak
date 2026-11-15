import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { floorPlanLayoutSchema } from "@/schemas/chairs/floor-plan.zod";
import { apiRequest } from "@/services/api/core/client";
import type { FloorPlanLayout } from "@/types/chairs/floor-plan.type";

export interface FloorPlanLayoutPayload {
  preset: string;
  zones: FloorPlanLayout["zones"];
  canvas: FloorPlanLayout["canvas"];
  decorations: FloorPlanLayout["decorations"];
}

export function saveFloorPlanLayout(branchId: string, payload: FloorPlanLayoutPayload): Promise<FloorPlanLayout> {
  return apiRequest(`${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/floor-plan`, { method: HttpMethod.Patch, body: payload, schema: floorPlanLayoutSchema });
}
