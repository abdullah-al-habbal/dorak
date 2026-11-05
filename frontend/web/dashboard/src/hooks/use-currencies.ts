"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { serviceKeys } from "@/lib/service-keys";
import { fetchCurrencies } from "@/services/api/query/currencies.query";
import type { Currency } from "@/types/currency.type";

const STALE_MS = 30 * 60_000;

export function useCurrencies(): UseQueryResult<Currency[]> {
  return useQuery({ queryKey: serviceKeys.currencies, queryFn: fetchCurrencies, staleTime: STALE_MS });
}
