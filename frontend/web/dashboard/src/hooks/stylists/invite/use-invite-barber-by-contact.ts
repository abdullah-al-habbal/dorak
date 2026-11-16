"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { invitationKeys } from "@/lib/query-keys/branches/invitation-keys";
import { inviteBarberByContact } from "@/services/api/mutation/branches/invitation.mutation";
import type { InviteBarberByContactPayload } from "@/services/api/mutation/branches/invitation.mutation";

interface InviteByContactVariables {
  branchId: string;
  payload: InviteBarberByContactPayload;
}

/** The backend answers the same whether or not the contact matched, so the toast never claims a barber was found. */
export function useInviteBarberByContact(): UseMutationResult<unknown, Error, InviteByContactVariables> {
  const { invitations } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ branchId, payload }: InviteByContactVariables) => inviteBarberByContact(branchId, payload),
    invalidate: [invitationKeys.all],
    successMessage: () => invitations.toast.requested,
  });
}
