"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { clientKeys } from "@/lib/query-keys/clients/client-keys";
import { unbanClient } from "@/services/api/mutation/clients/client-ban.mutation";
import type { AdminClient } from "@/types/clients/admin-client.type";

export function useUnbanClient(): UseMutationResult<AdminClient, Error, string> {
  const { clients } = useDictionary();
  return useFeedbackMutation({ mutationFn: unbanClient, invalidate: [clientKeys.all], successMessage: () => clients.toast.unbanned, errorMessage: () => clients.toast.unbanFailed });
}
