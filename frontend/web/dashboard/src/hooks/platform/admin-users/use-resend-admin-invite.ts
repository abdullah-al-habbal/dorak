"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { adminUserKeys } from "@/lib/query-keys/platform/admin-user-keys";
import { resendAdminInvite } from "@/services/api/mutation/platform/admin-user.mutation";

export function useResendAdminInvite(): UseMutationResult<void, Error, string> {
  const { adminUsers } = useDictionary();
  return useFeedbackMutation({
    mutationFn: resendAdminInvite,
    invalidate: [adminUserKeys.all],
    successMessage: () => adminUsers.toast.inviteResent,
    errorMessage: () => adminUsers.toast.inviteResendFailed,
  });
}
