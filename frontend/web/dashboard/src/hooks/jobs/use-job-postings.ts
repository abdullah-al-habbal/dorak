"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { jobKeys } from "@/lib/query-keys/jobs/job-keys";
import { fetchJobPostingPage } from "@/services/api/query/jobs/job-board.query";
import type { JobPostingPage } from "@/types/jobs/job-board-page.type";

export function useJobPostings(branchId: string, page: number): UseQueryResult<JobPostingPage> {
  return useListQuery(jobKeys.postings(branchId, page), () => fetchJobPostingPage(branchId, page));
}
