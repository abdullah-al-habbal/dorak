"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { payoutKeys } from "@/lib/payout-keys";
import { fetchPayoutPage } from "@/services/api/query/payout-page.query";
import type { PayoutFilters } from "@/types/payout-filters.type";
import type { PayoutPage } from "@/types/payout-page.type";

export function usePayouts(filters: PayoutFilters): UseQueryResult<PayoutPage> {
  return useListQuery(payoutKeys.list(filters.status ?? "", filters.page), () => fetchPayoutPage(filters));
}
