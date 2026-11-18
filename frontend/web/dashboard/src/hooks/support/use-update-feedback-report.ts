"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import type { FeedbackUpdatePayload } from "@/interfaces/support/feedback-update-payload.interface";
import { feedbackKeys } from "@/lib/query-keys/support/feedback-keys";
import { updateFeedbackReport } from "@/services/api/mutation/support/feedback.mutation";
import type { FeedbackReport } from "@/types/support/feedback-report.type";

/** The dialog shows a failure inline, so only success is toasted here. */
export function useUpdateFeedbackReport(): UseMutationResult<FeedbackReport, Error, FeedbackUpdatePayload> {
  const { support } = useDictionary();
  return useFeedbackMutation({
    mutationFn: updateFeedbackReport,
    invalidate: [feedbackKeys.all],
    successMessage: () => support.toast.updated,
  });
}
