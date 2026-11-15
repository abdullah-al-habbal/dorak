"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { branchKeys } from "@/lib/query-keys/branches/branch-keys";
import { fetchBranchPage } from "@/services/api/query/branches/branch-page.query";
import type { BranchFilters } from "@/types/branches/branch-filters.type";
import type { BranchPage } from "@/types/branches/branch-page.type";

export function useBranches(filters: BranchFilters): UseQueryResult<BranchPage> {
  return useListQuery(branchKeys.list(filters), () => fetchBranchPage(filters));
}
