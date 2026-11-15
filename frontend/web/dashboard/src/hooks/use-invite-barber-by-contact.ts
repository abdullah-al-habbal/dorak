"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { branchOversightKeys } from "@/lib/branch-oversight-keys";
import { invitationKeys } from "@/lib/invitation-keys";
import { inviteBarberByContact } from "@/services/api/mutation/invitation.mutation";
import type { InviteBarberByContactPayload } from "@/services/api/mutation/invitation.mutation";

interface InviteByContactVariables {
  branchId: string;
  payload: InviteBarberByContactPayload;
}

/** The backend answers the same whether or not the contact matched, so the toast never claims a barber was found. */
export function useInviteBarberByContact(): UseMutationResult<unknown, Error, InviteByContactVariables> {
  const { invitations } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ branchId, payload }: InviteByContactVariables) => inviteBarberByContact(branchId, payload),
    invalidate: [invitationKeys.all, branchOversightKeys.all],
    successMessage: () => invitations.toast.requested,
  });
}
