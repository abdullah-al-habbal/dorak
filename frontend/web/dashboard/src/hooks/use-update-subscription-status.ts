"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { adminSubscriptionKeys } from "@/lib/query-keys/plans/admin-subscription-keys";
import { conflictMessage } from "@/lib/conflict-message.util";
import { updateSubscriptionStatus } from "@/services/api/mutation/update-subscription-status.mutation";
import type { UpdateSubscriptionStatusVariables } from "@/services/api/mutation/update-subscription-status.mutation";
import type { AdminSubscription } from "@/types/admin-subscription.type";

export function useUpdateSubscriptionStatus(): UseMutationResult<AdminSubscription, Error, UpdateSubscriptionStatusVariables> {
  const { adminSubscriptions } = useDictionary();
  return useFeedbackMutation({
    mutationFn: updateSubscriptionStatus,
    invalidate: [adminSubscriptionKeys.all],
    successMessage: () => adminSubscriptions.toast.updated,
    // A 409 means the status already moved; the backend's message says why.
    errorMessage: (error) => conflictMessage(error, adminSubscriptions.toast.updateFailed),
  });
}
