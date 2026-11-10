"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { barberApprovalKeys } from "@/lib/barber-approval-keys";
import { setBarberActive } from "@/services/api/mutation/barber-account.mutation";
import type { BarberApproval } from "@/types/barber-approval.type";

export function useSetBarberActive(): UseMutationResult<BarberApproval, Error, { id: string; active: boolean }> {
  const { barberApprovals } = useDictionary();
  return useFeedbackMutation({
    mutationFn: setBarberActive,
    invalidate: [barberApprovalKeys.all],
    successMessage: (_barber, { active }) => (active ? barberApprovals.toast.activated : barberApprovals.toast.deactivated),
    errorMessage: () => barberApprovals.toast.activationFailed,
  });
}
