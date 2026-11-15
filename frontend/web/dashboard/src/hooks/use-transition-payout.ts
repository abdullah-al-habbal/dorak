"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import type { PayoutTransitionPayload } from "@/interfaces/earnings/payout-transition-payload.interface";
import { adminPayoutKeys } from "@/lib/query-keys/earnings/admin-payout-keys";
import { payoutKeys } from "@/lib/query-keys/earnings/payout-keys";
import { transitionPayout } from "@/services/api/mutation/transition-payout.mutation";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";

/** Failures are rethrown to the dialog, which shows the backend's reason inline. */
export function useTransitionPayout(): UseMutationResult<AdminPayout, Error, PayoutTransitionPayload> {
  const { adminPayouts } = useDictionary();
  return useFeedbackMutation({
    mutationFn: transitionPayout,
    // A 409 means someone else moved the payout first, so the list is refreshed either way.
    invalidate: [adminPayoutKeys.all, payoutKeys.all],
    successMessage: (_payout, { action }) => adminPayouts.toast[action],
  });
}
