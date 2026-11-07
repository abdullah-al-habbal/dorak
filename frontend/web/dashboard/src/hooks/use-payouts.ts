"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { payoutKeys } from "@/lib/payout-keys";
import { fetchPayoutPage } from "@/services/api/query/payout-page.query";
import type { PayoutFilters } from "@/types/payout-filters.type";
import type { PayoutPage } from "@/types/payout-page.type";

export function usePayouts(filters: PayoutFilters): UseQueryResult<PayoutPage> {
  return useQuery({
    queryKey: payoutKeys.list(filters.status ?? "", filters.page),
    queryFn: () => fetchPayoutPage(filters),
    placeholderData: keepPreviousData,
  });
}
