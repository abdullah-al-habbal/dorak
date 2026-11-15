"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useSaveMutation } from "@/hooks/core/query/use-save-mutation";
import type { SaveVariables } from "@/interfaces/core/query/save-variables.interface";
import { currencyAdminKeys } from "@/lib/query-keys/platform/currency-admin-keys";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { createCurrency, updateCurrency } from "@/services/api/mutation/platform/currency-admin.mutation";
import type { CurrencyPayload } from "@/services/api/mutation/platform/currency-admin.mutation";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

/** Also refreshes the currency picker the service form reads. */
export function useSaveCurrency(): UseMutationResult<AdminCurrency, Error, SaveVariables<CurrencyPayload>> {
  const { currencies } = useDictionary();
  return useSaveMutation({ create: createCurrency, update: updateCurrency, invalidate: [currencyAdminKeys.all, serviceKeys.currencies], messages: currencies.toast });
}
