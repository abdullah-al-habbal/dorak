"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";
import { useReferenceQuery } from "@/hooks/core/use-reference-query";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { fetchCurrencies } from "@/services/api/query/platform/currencies.query";
import type { Currency } from "@/types/platform/currency.type";

export function useCurrencies(): UseQueryResult<Currency[]> {
  return useReferenceQuery(serviceKeys.currencies, fetchCurrencies, STALE_TIME.Static);
}
