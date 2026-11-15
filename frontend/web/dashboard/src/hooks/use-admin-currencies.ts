"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { currencyAdminKeys } from "@/lib/query-keys/platform/currency-admin-keys";
import { fetchAdminCurrencies, fetchExchangeRates } from "@/services/api/query/currency-admin.query";
import type { AdminCurrency, ExchangeRate } from "@/types/currency-admin.type";

export function useAdminCurrencies(): UseQueryResult<AdminCurrency[]> {
  return useListQuery(currencyAdminKeys.currencies, fetchAdminCurrencies);
}

export function useExchangeRates(): UseQueryResult<ExchangeRate[]> {
  return useListQuery(currencyAdminKeys.rates, fetchExchangeRates);
}
