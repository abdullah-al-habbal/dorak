"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { barberApprovalKeys } from "@/lib/query-keys/stylists/barber-approval-keys";
import { unbanBarber } from "@/services/api/mutation/barber-account.mutation";
import type { BarberApproval } from "@/types/barber-approval.type";

export function useUnbanBarber(): UseMutationResult<BarberApproval, Error, string> {
  const { barberApprovals } = useDictionary();
  return useFeedbackMutation({ mutationFn: unbanBarber, invalidate: [barberApprovalKeys.all], successMessage: () => barberApprovals.toast.unbanned, errorMessage: () => barberApprovals.toast.unbanFailed });
}
