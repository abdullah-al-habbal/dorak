"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { branchOversightKeys } from "@/lib/query-keys/branches/branch-oversight-keys";
import { jobKeys } from "@/lib/query-keys/jobs/job-keys";
import { deleteJobPosting } from "@/services/api/mutation/job-board.mutation";

export function useDeleteJobPosting(branchId: string): UseMutationResult<void, Error, string> {
  const { jobs } = useDictionary();
  return useDeleteMutation({ remove: (id) => deleteJobPosting(branchId, id), invalidate: [jobKeys.all, branchOversightKeys.all], messages: jobs.toast });
}
