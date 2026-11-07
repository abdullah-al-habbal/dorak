"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { branchKeys } from "@/lib/branch-keys";
import { fetchBranchDetail } from "@/services/api/query/branch-detail.query";
import type { BranchDetail } from "@/types/branch-detail.type";

/** The list rows carry text in one locale; the edit form needs the full detail with both translations. */
export function useBranchDetail(id: string | undefined): UseQueryResult<BranchDetail> {
  return useQuery({ queryKey: branchKeys.detail(id ?? ""), queryFn: () => fetchBranchDetail(id ?? ""), enabled: id !== undefined, gcTime: 0 });
}
