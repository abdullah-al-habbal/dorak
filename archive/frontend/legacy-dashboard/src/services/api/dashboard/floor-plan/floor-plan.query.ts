import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import {
  floorPlanPayload,
  mapFloorPlan,
} from "@/services/api/dashboard/floor-plan/floor-plan.mapper.util";
import type { IFloorPlan } from "@/services/api/dashboard/floor-plan/types/ifloor-plan.types";
import type { IFloorPlanLayout } from "@/services/api/dashboard/floor-plan/types/ifloor-plan-layout.types";

export const floorPlanQueryKey = (branchId: string) =>
  ["dashboard", "floor-plan", branchId] as const;

export async function getBranchFloorPlan(
  branchId: string,
): Promise<IFloorPlan> {
  return mapFloorPlan(
    await api.get<unknown>(DashboardEndpoints.branchFloorPlan(branchId)),
  );
}

export function updateBranchFloorPlan(
  branchId: string,
  layout: IFloorPlanLayout,
) {
  return api.patch<unknown>(
    DashboardEndpoints.branchFloorPlan(branchId),
    floorPlanPayload(layout),
  );
}
