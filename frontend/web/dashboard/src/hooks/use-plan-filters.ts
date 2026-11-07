"use client";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { planFiltersFromParams, planFiltersToParams } from "@/lib/plan-filters.util";
import type { PlanFilters } from "@/types/plan-filters.type";

/** The URL is the source of truth for the state filter and page. */
export function usePlanFilters(): { filters: PlanFilters; update: (patch: Partial<PlanFilters>) => void } {
  return useUrlFilters(planFiltersFromParams, planFiltersToParams);
}
