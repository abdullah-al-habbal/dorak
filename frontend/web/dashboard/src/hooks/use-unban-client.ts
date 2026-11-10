"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { clientKeys } from "@/lib/client-keys";
import { unbanClient } from "@/services/api/mutation/client-ban.mutation";
import type { AdminClient } from "@/types/admin-client.type";

export function useUnbanClient(): UseMutationResult<AdminClient, Error, string> {
  const { clients } = useDictionary();
  return useFeedbackMutation({ mutationFn: unbanClient, invalidate: [clientKeys.all], successMessage: () => clients.toast.unbanned, errorMessage: () => clients.toast.unbanFailed });
}
