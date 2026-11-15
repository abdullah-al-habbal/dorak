"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { barberApprovalKeys } from "@/lib/query-keys/stylists/barber-approval-keys";
import { rejectBarber } from "@/services/api/mutation/review-barber.mutation";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

/** Failures are rethrown to the dialog, which shows the backend's reason inline. */
export function useRejectBarber(): UseMutationResult<BarberApproval, Error, { id: string; reason: string }> {
  const { barberApprovals } = useDictionary();
  return useFeedbackMutation({
    mutationFn: rejectBarber,
    invalidate: [barberApprovalKeys.all],
    successMessage: () => barberApprovals.toast.rejected,
  });
}
