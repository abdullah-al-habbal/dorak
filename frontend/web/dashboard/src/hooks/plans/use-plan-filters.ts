"use client";

import { useUrlFilters } from "@/hooks/core/state/use-url-filters";
import { planFiltersFromParams, planFiltersToParams } from "@/lib/plans/plan-filters.util";
import type { PlanFilters } from "@/types/plans/plan-filters.type";

/** The URL is the source of truth for the state filter and page. */
export function usePlanFilters(): { filters: PlanFilters; update: (patch: Partial<PlanFilters>) => void } {
  return useUrlFilters(planFiltersFromParams, planFiltersToParams);
}
