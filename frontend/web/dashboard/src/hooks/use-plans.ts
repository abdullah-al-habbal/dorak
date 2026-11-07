"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { planKeys } from "@/lib/plan-keys";
import { fetchPlanPage } from "@/services/api/query/plan-page.query";
import type { PlanFilters } from "@/types/plan-filters.type";
import type { PlanPage } from "@/types/plan-page.type";

export function usePlans(filters: PlanFilters): UseQueryResult<PlanPage> {
  return useQuery({
    queryKey: planKeys.list(filters.state ?? "", filters.page),
    queryFn: () => fetchPlanPage(filters),
    placeholderData: keepPreviousData,
  });
}
