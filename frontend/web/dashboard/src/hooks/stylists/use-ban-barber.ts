"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { barberApprovalKeys } from "@/lib/query-keys/stylists/barber-approval-keys";
import { banBarber } from "@/services/api/mutation/stylists/barber-account.mutation";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

/** Failures are rethrown to the dialog, which shows them inline. */
export function useBanBarber(): UseMutationResult<BarberApproval, Error, { id: string; reason: string; expiresAt?: string }> {
  const { barberApprovals } = useDictionary();
  return useFeedbackMutation({ mutationFn: banBarber, invalidate: [barberApprovalKeys.all], successMessage: () => barberApprovals.toast.banned });
}
