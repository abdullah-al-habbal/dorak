"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { invitationKeys } from "@/lib/query-keys/branches/invitation-keys";
import { actOnInvitation } from "@/services/api/mutation/branches/invitation.mutation";
import type { InvitationAction } from "@/services/api/mutation/branches/invitation.mutation";
import type { BranchInvitation } from "@/types/branches/branch-invitation.type";

interface ActVariables {
  branchId: string;
  id: string;
  action: InvitationAction;
}

export function useActOnInvitation(): UseMutationResult<BranchInvitation, Error, ActVariables> {
  const { invitations } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ branchId, id, action }: ActVariables) => actOnInvitation(branchId, id, action),
    invalidate: [invitationKeys.all],
    successMessage: (_data, { action }) => invitations.toast[action],
    errorMessage: () => invitations.toast.failed,
  });
}
