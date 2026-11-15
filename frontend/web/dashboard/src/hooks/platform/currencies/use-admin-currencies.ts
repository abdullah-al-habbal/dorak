"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { currencyAdminKeys } from "@/lib/query-keys/platform/currency-admin-keys";
import { fetchAdminCurrencies, fetchExchangeRates } from "@/services/api/query/platform/currency-admin.query";
import type { AdminCurrency, ExchangeRate } from "@/types/platform/currency-admin.type";

export function useAdminCurrencies(): UseQueryResult<AdminCurrency[]> {
  return useListQuery(currencyAdminKeys.currencies, fetchAdminCurrencies);
}

export function useExchangeRates(): UseQueryResult<ExchangeRate[]> {
  return useListQuery(currencyAdminKeys.rates, fetchExchangeRates);
}
