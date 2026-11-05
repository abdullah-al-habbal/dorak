"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { AUTH_MUTATION_KEYS } from "@/services/api/auth/auth-mutation-keys.constant";
import { requestLogin } from "@/services/api/auth/auth.mutation";

export function useLoginMutation() {
  return useApiMutation({
    mutationKey: AUTH_MUTATION_KEYS.login,
    mutationFn: requestLogin,
    successMessage: "signedIn",
  });
}
