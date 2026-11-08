"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { planKeys } from "@/lib/plan-keys";
import { fetchPlanPage } from "@/services/api/query/plan-page.query";
import type { PlanFilters } from "@/types/plan-filters.type";
import type { PlanPage } from "@/types/plan-page.type";

export function usePlans(filters: PlanFilters): UseQueryResult<PlanPage> {
  return useListQuery(planKeys.list(filters.state ?? "", filters.page), () => fetchPlanPage(filters));
}
