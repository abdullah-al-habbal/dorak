"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";

import { jobKeys } from "@/lib/query-keys/jobs/job-keys";
import { markApplicationsSeen } from "@/services/api/mutation/jobs/job-board.mutation";
import type { MarkApplicationsSeenVariables } from "@/services/api/mutation/jobs/job-board.mutation";

/** Quiet by design: seeing an application needs no toast, only refreshed lists. */
export function useMarkApplicationsSeen(): UseMutationResult<void, Error, MarkApplicationsSeenVariables> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markApplicationsSeen,
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}
