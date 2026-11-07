"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { adminPayoutKeys } from "@/lib/admin-payout-keys";
import { fetchAdminPayoutPage } from "@/services/api/query/admin-payout-page.query";
import type { AdminPayoutPage } from "@/types/admin-payout-page.type";
import type { PayoutFilters } from "@/types/payout-filters.type";

export function useAdminPayouts(filters: PayoutFilters): UseQueryResult<AdminPayoutPage> {
  return useQuery({
    queryKey: adminPayoutKeys.list(filters.status ?? "", filters.page),
    queryFn: () => fetchAdminPayoutPage(filters),
    placeholderData: keepPreviousData,
  });
}
