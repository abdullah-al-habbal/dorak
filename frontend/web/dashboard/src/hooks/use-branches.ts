"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { branchKeys } from "@/lib/branch-keys";
import { fetchBranchPage } from "@/services/api/query/branch-page.query";
import type { BranchFilters } from "@/types/branch-filters.type";
import type { BranchPage } from "@/types/branch-page.type";

export function useBranches(filters: BranchFilters): UseQueryResult<BranchPage> {
  return useQuery({ queryKey: branchKeys.list(filters), queryFn: () => fetchBranchPage(filters), placeholderData: keepPreviousData });
}
