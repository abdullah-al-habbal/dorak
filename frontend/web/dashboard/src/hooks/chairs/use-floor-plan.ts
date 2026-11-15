"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useDetailQuery } from "@/hooks/core/use-detail-query";
import { floorPlanKeys } from "@/lib/query-keys/chairs/floor-plan-keys";
import { fetchFloorPlan } from "@/services/api/query/floor-plan.query";
import type { FloorPlan } from "@/types/chairs/floor-plan.type";

export function useFloorPlan(branchId: string | null): UseQueryResult<FloorPlan> {
  return useDetailQuery(branchId, floorPlanKeys.branch, fetchFloorPlan);
}
