"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { adminSubscriptionKeys } from "@/lib/query-keys/plans/admin-subscription-keys";
import { assignSubscription } from "@/services/api/mutation/assign-subscription.mutation";
import type { AssignSubscriptionVariables } from "@/services/api/mutation/assign-subscription.mutation";
import type { AdminSubscription } from "@/types/plans/admin-subscription.type";

/** Failures are rethrown to the dialog, which shows the backend's reason inline. */
export function useAssignSubscription(): UseMutationResult<AdminSubscription, Error, AssignSubscriptionVariables> {
  const { adminSubscriptions } = useDictionary();
  return useFeedbackMutation({
    mutationFn: assignSubscription,
    invalidate: [adminSubscriptionKeys.all],
    successMessage: () => adminSubscriptions.toast.assigned,
  });
}
