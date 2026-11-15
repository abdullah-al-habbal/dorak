"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { adminPayoutKeys } from "@/lib/query-keys/earnings/admin-payout-keys";
import { generatePayouts } from "@/services/api/mutation/generate-payouts.mutation";
import type { AdminPayout } from "@/types/admin-payout.type";

export function useGeneratePayouts(): UseMutationResult<AdminPayout[], Error, void> {
  const { adminPayouts } = useDictionary();
  return useFeedbackMutation({
    mutationFn: generatePayouts,
    invalidate: [adminPayoutKeys.all],
    successMessage: (created) => (created.length === 0 ? adminPayouts.toast.nothingToGenerate : adminPayouts.toast.generated.replace("{count}", String(created.length))),
    errorMessage: () => adminPayouts.toast.generateFailed,
  });
}
