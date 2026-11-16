"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { jobKeys } from "@/lib/query-keys/jobs/job-keys";
import { markApplicationsSeen } from "@/services/api/mutation/jobs/job-board.mutation";
import type { MarkApplicationsSeenVariables } from "@/services/api/mutation/jobs/job-board.mutation";

/** The manager's "mark all new as seen" action; opening a vacancy no longer does it for them. */
export function useMarkApplicationsSeen(): UseMutationResult<void, Error, MarkApplicationsSeenVariables> {
  const { jobs } = useDictionary();
  return useFeedbackMutation({
    mutationFn: markApplicationsSeen,
    invalidate: [jobKeys.all],
    successMessage: () => jobs.toast.markedSeen,
    errorMessage: () => jobs.toast.failed,
  });
}
