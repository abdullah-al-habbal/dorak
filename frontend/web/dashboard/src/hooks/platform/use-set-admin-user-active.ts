"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { adminUserKeys } from "@/lib/query-keys/platform/admin-user-keys";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { deactivateAdminUser, reactivateAdminUser } from "@/services/api/mutation/platform/admin-user.mutation";
import type { AdminUser } from "@/types/platform/admin-user.type";

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
