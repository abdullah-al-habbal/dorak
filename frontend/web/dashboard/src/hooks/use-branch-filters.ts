"use client";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { branchFiltersFromParams, branchFiltersToParams } from "@/lib/branch-filters.util";
import type { BranchFilters } from "@/types/branch-filters.type";

/** The URL is the source of truth for branch filters. */
export function useBranchFilters(): { filters: BranchFilters; update: (patch: Partial<BranchFilters>) => void } {
  return useUrlFilters(branchFiltersFromParams, branchFiltersToParams);
}
