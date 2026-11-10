"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { AdminUserPayload } from "@/interfaces/admin-user-payload.interface";
import type { SaveVariables } from "@/interfaces/save-variables.interface";
import { adminUserKeys } from "@/lib/admin-user-keys";
import { inviteAdminUser, updateAdminUser } from "@/services/api/mutation/admin-user.mutation";
import type { AdminUser } from "@/types/admin-user.type";

export function useSaveAdminUser(): UseMutationResult<AdminUser, Error, SaveVariables<AdminUserPayload>> {
  const { adminUsers } = useDictionary();
  return useSaveMutation({
    create: inviteAdminUser,
    update: updateAdminUser,
    invalidate: [adminUserKeys.all],
    messages: adminUsers.toast,
  });
}
