"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { currencyAdminKeys } from "@/lib/query-keys/platform/currency-admin-keys";
import { deleteExchangeRate } from "@/services/api/mutation/currency-admin.mutation";

export function useDeleteExchangeRate(): UseMutationResult<void, Error, string> {
  const { currencies } = useDictionary();
  return useDeleteMutation({ remove: deleteExchangeRate, invalidate: [currencyAdminKeys.rates], messages: { deleted: currencies.toast.rateDeleted, deleteFailed: currencies.toast.rateDeleteFailed } });
}
