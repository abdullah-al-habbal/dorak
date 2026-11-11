"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { jobKeys } from "@/lib/job-keys";
import { fetchJobPostingPage } from "@/services/api/query/job-board.query";
import type { JobPostingPage } from "@/types/job-board-page.type";

export function useJobPostings(branchId: string, page: number): UseQueryResult<JobPostingPage> {
  return useListQuery(jobKeys.postings(branchId, page), () => fetchJobPostingPage(branchId, page));
}
