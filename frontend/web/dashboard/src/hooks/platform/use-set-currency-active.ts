"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { currencyAdminKeys } from "@/lib/query-keys/platform/currency-admin-keys";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { setCurrencyActive } from "@/services/api/mutation/platform/currency-admin.mutation";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

interface ActiveVariables {
  id: string;
  active: boolean;
}

export function useSetCurrencyActive(): UseMutationResult<AdminCurrency, Error, ActiveVariables> {
  const { currencies } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, active }: ActiveVariables) => setCurrencyActive(id, active),
    invalidate: [currencyAdminKeys.all, serviceKeys.currencies],
    successMessage: (_data, { active }) => (active ? currencies.toast.restored : currencies.toast.retired),
    errorMessage: () => currencies.toast.activeFailed,
  });
}
