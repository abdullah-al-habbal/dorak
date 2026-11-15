"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { currencyAdminKeys } from "@/lib/query-keys/platform/currency-admin-keys";
import { createExchangeRate } from "@/services/api/mutation/currency-admin.mutation";
import type { ExchangeRatePayload } from "@/services/api/mutation/currency-admin.mutation";
import type { ExchangeRate } from "@/types/platform/currency-admin.type";

/** The dialog shows field errors itself. */
export function useSaveExchangeRate(): UseMutationResult<ExchangeRate, Error, ExchangeRatePayload> {
  const { currencies } = useDictionary();
  return useFeedbackMutation({
    mutationFn: createExchangeRate,
    invalidate: [currencyAdminKeys.rates],
    successMessage: () => currencies.toast.rateSaved,
  });
}
