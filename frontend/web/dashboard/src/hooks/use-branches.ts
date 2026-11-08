"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { branchKeys } from "@/lib/branch-keys";
import { fetchBranchPage } from "@/services/api/query/branch-page.query";
import type { BranchFilters } from "@/types/branch-filters.type";
import type { BranchPage } from "@/types/branch-page.type";

export function useBranches(filters: BranchFilters): UseQueryResult<BranchPage> {
  return useListQuery(branchKeys.list(filters), () => fetchBranchPage(filters));
}
