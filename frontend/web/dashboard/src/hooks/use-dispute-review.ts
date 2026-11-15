"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import type { ReviewDisputePayload } from "@/interfaces/clients/review-dispute-payload.interface";
import { reviewKeys } from "@/lib/query-keys/clients/review-keys";
import { disputeReview } from "@/services/api/mutation/dispute-review.mutation";
import type { Review } from "@/types/clients/review.type";

/** Failures are rethrown to the dialog (a 422 means the review is no longer published). */
export function useDisputeReview(): UseMutationResult<Review, Error, ReviewDisputePayload> {
  const { reviews } = useDictionary();
  return useFeedbackMutation({
    mutationFn: disputeReview,
    invalidate: [reviewKeys.all],
    successMessage: () => reviews.dispute.success,
  });
}
