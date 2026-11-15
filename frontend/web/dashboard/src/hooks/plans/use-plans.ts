"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { planKeys } from "@/lib/query-keys/plans/plan-keys";
import { fetchPlanPage } from "@/services/api/query/plans/plan-page.query";
import type { PlanFilters } from "@/types/plans/plan-filters.type";
import type { PlanPage } from "@/types/plans/plan-page.type";

export function usePlans(filters: PlanFilters): UseQueryResult<PlanPage> {
  return useListQuery(planKeys.list(filters.state ?? "", filters.page), () => fetchPlanPage(filters));
}
