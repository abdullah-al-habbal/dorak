"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { barberApprovalKeys } from "@/lib/query-keys/stylists/barber-approval-keys";
import { approveBarber } from "@/services/api/mutation/review-barber.mutation";
import type { BarberApproval } from "@/types/barber-approval.type";

export function useApproveBarber(): UseMutationResult<BarberApproval, Error, string> {
  const { barberApprovals } = useDictionary();
  return useFeedbackMutation({
    mutationFn: approveBarber,
    invalidate: [barberApprovalKeys.all],
    successMessage: () => barberApprovals.toast.approved,
    errorMessage: () => barberApprovals.toast.approveFailed,
  });
}
