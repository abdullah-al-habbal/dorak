"use client";

import { useUrlFilters } from "@/hooks/core/use-url-filters";
import { branchFiltersFromParams, branchFiltersToParams } from "@/lib/branches/branch-filters.util";
import type { BranchFilters } from "@/types/branches/branch-filters.type";

/** The URL is the source of truth for branch filters. */
export function useBranchFilters(): { filters: BranchFilters; update: (patch: Partial<BranchFilters>) => void } {
  return useUrlFilters(branchFiltersFromParams, branchFiltersToParams);
}
