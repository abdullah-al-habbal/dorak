"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { PLAN_OPTIONS_LIMIT } from "@/config/plan.constant";
import { PlanState } from "@/enums/plan-state.enum";
import { planKeys } from "@/lib/plan-keys";
import { fetchPlanPage } from "@/services/api/query/plan-page.query";
import type { Plan } from "@/types/plan.type";

/** Every active plan, for the assign dialog. Refreshed whenever a plan is saved. */
export function usePlanOptions(): UseQueryResult<Plan[]> {
  return useQuery({
    queryKey: planKeys.options,
    queryFn: async () => (await fetchPlanPage({ state: PlanState.Active, page: 1 }, PLAN_OPTIONS_LIMIT)).items,
  });
}
