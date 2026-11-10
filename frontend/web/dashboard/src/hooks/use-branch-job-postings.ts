"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { branchOversightKeys } from "@/lib/branch-oversight-keys";
import { fetchBranchJobPostings } from "@/services/api/query/branch-oversight.query";
import type { BranchJobPosting } from "@/types/branch-job-posting.type";

export function useBranchJobPostings(branchId: string): UseQueryResult<BranchJobPosting[]> {
  return useQuery({ queryKey: branchOversightKeys.jobPostings(branchId), queryFn: () => fetchBranchJobPostings(branchId) });
}
