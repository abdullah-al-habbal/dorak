"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { SaveVariables } from "@/interfaces/save-variables.interface";
import { currencyAdminKeys } from "@/lib/currency-admin-keys";
import { serviceKeys } from "@/lib/service-keys";
import { createCurrency, updateCurrency } from "@/services/api/mutation/currency-admin.mutation";
import type { CurrencyPayload } from "@/services/api/mutation/currency-admin.mutation";
import type { AdminCurrency } from "@/types/currency-admin.type";

/** Also refreshes the currency picker the service form reads. */
export function useSaveCurrency(): UseMutationResult<AdminCurrency, Error, SaveVariables<CurrencyPayload>> {
  const { currencies } = useDictionary();
  return useSaveMutation({ create: createCurrency, update: updateCurrency, invalidate: [currencyAdminKeys.all, serviceKeys.currencies], messages: currencies.toast });
}
