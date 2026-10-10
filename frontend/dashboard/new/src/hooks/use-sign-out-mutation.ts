"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { AUTH_MUTATION_KEYS } from "@/services/api/auth/auth-mutation-keys.constant";
import { requestLogout } from "@/services/api/auth/auth.mutation";

export function useSignOutMutation() {
  return useApiMutation({
    mutationKey: AUTH_MUTATION_KEYS.logout,
    mutationFn: requestLogout,
    successMessage: "signedOut",
  });
}
