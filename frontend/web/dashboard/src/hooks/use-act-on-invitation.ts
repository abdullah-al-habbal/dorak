"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { branchOversightKeys } from "@/lib/branch-oversight-keys";
import { invitationKeys } from "@/lib/invitation-keys";
import { actOnInvitation } from "@/services/api/mutation/invitation.mutation";
import type { InvitationAction } from "@/services/api/mutation/invitation.mutation";
import type { BranchInvitation } from "@/types/branch-invitation.type";

interface ActVariables {
  branchId: string;
  id: string;
  action: InvitationAction;
}

export function useActOnInvitation(): UseMutationResult<BranchInvitation, Error, ActVariables> {
  const { invitations } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ branchId, id, action }: ActVariables) => actOnInvitation(branchId, id, action),
    invalidate: [invitationKeys.all, branchOversightKeys.all],
    successMessage: (_data, { action }) => invitations.toast[action],
    errorMessage: () => invitations.toast.failed,
  });
}
