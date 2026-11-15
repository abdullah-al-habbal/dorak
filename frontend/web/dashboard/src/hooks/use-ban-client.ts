"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { clientKeys } from "@/lib/query-keys/clients/client-keys";
import { banClient } from "@/services/api/mutation/client-ban.mutation";
import type { AdminClient } from "@/types/clients/admin-client.type";

interface BanVariables {
  id: string;
  reason: string;
  expiresAt?: string;
}

/** Failures are rethrown to the dialog, which shows the backend's reason inline. */
export function useBanClient(): UseMutationResult<AdminClient, Error, BanVariables> {
  const { clients } = useDictionary();
  return useFeedbackMutation({ mutationFn: banClient, invalidate: [clientKeys.all], successMessage: () => clients.toast.banned });
}
