"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { SaveVariables } from "@/interfaces/core/save-variables.interface";
import { branchOversightKeys } from "@/lib/query-keys/branches/branch-oversight-keys";
import { jobKeys } from "@/lib/query-keys/jobs/job-keys";
import { createJobPosting, updateJobPosting } from "@/services/api/mutation/job-board.mutation";
import type { JobPostingInput } from "@/services/api/mutation/job-board.mutation";
import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";

/** The dialog maps a 403 (job board off for the plan) and field errors itself. */
export function useSaveJobPosting(): UseMutationResult<BranchJobPosting, Error, SaveVariables<JobPostingInput>> {
  const { jobs } = useDictionary();
  return useSaveMutation({ create: createJobPosting, update: updateJobPosting, invalidate: [jobKeys.all, branchOversightKeys.all], messages: jobs.toast });
}
