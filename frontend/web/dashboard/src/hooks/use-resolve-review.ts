"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import type { ReviewResolvePayload } from "@/interfaces/clients/review-resolve-payload.interface";
import { reviewModerationKeys } from "@/lib/query-keys/clients/review-moderation-keys";
import { resolveReview } from "@/services/api/mutation/resolve-review.mutation";
import type { AdminReview } from "@/types/clients/admin-review.type";

/** Failures are rethrown to the dialog, which shows them inline (a 422 means someone resolved it first). */
export function useResolveReview(): UseMutationResult<AdminReview, Error, ReviewResolvePayload> {
  const { reviewModeration } = useDictionary();
  return useFeedbackMutation({
    mutationFn: resolveReview,
    invalidate: [reviewModerationKeys.all],
    successMessage: (_review, { status }) => reviewModeration.toast[status === "hidden" ? "hidden" : "published"],
  });
}
