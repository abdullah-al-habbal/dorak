"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { adminPayoutKeys } from "@/lib/query-keys/earnings/admin-payout-keys";
import { generatePayouts } from "@/services/api/mutation/earnings/generate-payouts.mutation";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";

export function useGeneratePayouts(): UseMutationResult<AdminPayout[], Error, void> {
  const { adminPayouts } = useDictionary();
  return useFeedbackMutation({
    mutationFn: generatePayouts,
    invalidate: [adminPayoutKeys.all],
    successMessage: (created) => (created.length === 0 ? adminPayouts.toast.nothingToGenerate : adminPayouts.toast.generated.replace("{count}", String(created.length))),
    errorMessage: () => adminPayouts.toast.generateFailed,
  });
}
