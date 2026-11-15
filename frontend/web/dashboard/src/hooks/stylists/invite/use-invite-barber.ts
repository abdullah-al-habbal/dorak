"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { branchOversightKeys } from "@/lib/query-keys/branches/branch-oversight-keys";
import { invitationKeys } from "@/lib/query-keys/branches/invitation-keys";
import { inviteBarber } from "@/services/api/mutation/branches/invitation.mutation";
import type { InviteBarberPayload } from "@/services/api/mutation/branches/invitation.mutation";
import type { BranchInvitation } from "@/types/branches/branch-invitation.type";

interface InviteVariables {
  branchId: string;
  payload: InviteBarberPayload;
}

/** Failures are rethrown to the dialog (a 409 means the barber already has an invitation here). */
export function useInviteBarber(): UseMutationResult<BranchInvitation, Error, InviteVariables> {
  const { invitations } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ branchId, payload }: InviteVariables) => inviteBarber(branchId, payload),
    invalidate: [invitationKeys.all, branchOversightKeys.all],
    successMessage: () => invitations.toast.invited,
  });
}
