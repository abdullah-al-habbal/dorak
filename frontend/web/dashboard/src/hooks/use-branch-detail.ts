"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useDetailQuery } from "@/hooks/use-detail-query";
import { branchKeys } from "@/lib/query-keys/branches/branch-keys";
import { fetchBranchDetail } from "@/services/api/query/branch-detail.query";
import type { BranchDetail } from "@/types/branch-detail.type";

/** The list rows carry text in one locale; the edit form needs the full detail with both translations. */
export function useBranchDetail(id: string | undefined): UseQueryResult<BranchDetail> {
  return useDetailQuery(id, branchKeys.detail, fetchBranchDetail, { gcTime: 0 });
}
