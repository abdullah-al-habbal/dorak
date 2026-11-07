"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import type { PayoutTransitionPayload } from "@/interfaces/payout-transition-payload.interface";
import { adminPayoutKeys } from "@/lib/admin-payout-keys";
import { payoutKeys } from "@/lib/payout-keys";
import { transitionPayout } from "@/services/api/mutation/transition-payout.mutation";
import type { AdminPayout } from "@/types/admin-payout.type";

/** Failures are rethrown to the dialog, which shows the backend's reason inline. */
export function useTransitionPayout(): UseMutationResult<AdminPayout, Error, PayoutTransitionPayload> {
  const { adminPayouts } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: transitionPayout,
    onSuccess: (_payout, { action }) => toast.success(adminPayouts.toast[action]),
    // A 409 means someone else moved the payout first, so the list is refreshed either way.
    onSettled: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: adminPayoutKeys.all }), client.invalidateQueries({ queryKey: payoutKeys.all })]);
    },
  });
}
