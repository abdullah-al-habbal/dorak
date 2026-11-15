"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { PLAN_OPTIONS_LIMIT } from "@/config/plan.constant";
import { PlanState } from "@/enums/plan-state.enum";
import { useReferenceQuery } from "@/hooks/use-reference-query";
import { planKeys } from "@/lib/query-keys/plans/plan-keys";
import { fetchPlanPage } from "@/services/api/query/plan-page.query";
import type { Plan } from "@/types/plans/plan.type";

async function fetchActivePlans(): Promise<Plan[]> {
  return (await fetchPlanPage({ state: PlanState.Active, page: 1 }, PLAN_OPTIONS_LIMIT)).items;
}

/** Every active plan, for the assign dialog. Cached as reference data; saving or deleting a plan invalidates `planKeys.all`, which refreshes it. */
export function usePlanOptions(): UseQueryResult<Plan[]> {
  return useReferenceQuery(planKeys.options, fetchActivePlans);
}
