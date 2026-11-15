"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { adminUserKeys } from "@/lib/query-keys/platform/admin-user-keys";
import { resendAdminInvite } from "@/services/api/mutation/admin-user.mutation";

export function useResendAdminInvite(): UseMutationResult<void, Error, string> {
  const { adminUsers } = useDictionary();
  return useFeedbackMutation({
    mutationFn: resendAdminInvite,
    invalidate: [adminUserKeys.all],
    successMessage: () => adminUsers.toast.inviteResent,
    errorMessage: () => adminUsers.toast.inviteResendFailed,
  });
}
