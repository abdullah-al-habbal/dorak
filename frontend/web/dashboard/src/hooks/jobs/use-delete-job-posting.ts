"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/core/query/use-delete-mutation";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { jobKeys } from "@/lib/query-keys/jobs/job-keys";
import { deleteJobPosting } from "@/services/api/mutation/jobs/job-board.mutation";

export function useDeleteJobPosting(branchId: string): UseMutationResult<void, Error, string> {
  const { jobs } = useDictionary();
  return useDeleteMutation({ remove: (id) => deleteJobPosting(branchId, id), invalidate: [jobKeys.all], messages: jobs.toast });
}
