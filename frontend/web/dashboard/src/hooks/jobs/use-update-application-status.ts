"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { branchOversightKeys } from "@/lib/query-keys/branches/branch-oversight-keys";
import { jobKeys } from "@/lib/query-keys/jobs/job-keys";
import { updateApplicationStatus } from "@/services/api/mutation/job-board.mutation";
import type { JobApplication } from "@/types/jobs/job-application.type";

interface StatusVariables {
  branchId: string;
  postingId: string;
  id: string;
  status: string;
}

export function useUpdateApplicationStatus(): UseMutationResult<JobApplication, Error, StatusVariables> {
  const { jobs } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ branchId, postingId, id, status }: StatusVariables) => updateApplicationStatus(branchId, postingId, id, status),
    invalidate: [jobKeys.all, branchOversightKeys.all],
    successMessage: () => jobs.toast.statusUpdated,
    errorMessage: () => jobs.toast.failed,
  });
}
