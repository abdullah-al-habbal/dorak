"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { adminUserKeys } from "@/lib/admin-user-keys";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { deactivateAdminUser, reactivateAdminUser } from "@/services/api/mutation/admin-user.mutation";
import type { AdminUser } from "@/types/admin-user.type";

const HTTP_CONFLICT = 409;

interface SetActiveVariables {
  id: string;
  active: boolean;
}

/** A 409 is a guard (yourself, the last active admin); its backend message is the useful toast. */
export function useSetAdminUserActive(): UseMutationResult<AdminUser, Error, SetActiveVariables> {
  const { adminUsers } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, active }) => (active ? reactivateAdminUser(id) : deactivateAdminUser(id)),
    invalidate: [adminUserKeys.all],
    successMessage: (_admin, { active }) => (active ? adminUsers.toast.reactivated : adminUsers.toast.deactivated),
    errorMessage: (error) => (error instanceof ApiClientError && error.status === HTTP_CONFLICT ? error.message : adminUsers.toast.failed),
  });
}
