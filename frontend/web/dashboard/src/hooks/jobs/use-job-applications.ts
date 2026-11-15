"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { jobKeys } from "@/lib/query-keys/jobs/job-keys";
import { fetchJobApplicationPage } from "@/services/api/query/jobs/job-board.query";
import type { JobApplicationPage } from "@/types/jobs/job-board-page.type";

export function useJobApplications(branchId: string, postingId: string, page: number): UseQueryResult<JobApplicationPage> {
  return useListQuery(jobKeys.applications(branchId, postingId, page), () => fetchJobApplicationPage(branchId, postingId, page));
}
