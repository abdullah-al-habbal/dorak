"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { adminPayoutKeys } from "@/lib/admin-payout-keys";
import { fetchAdminPayoutPage } from "@/services/api/query/admin-payout-page.query";
import type { AdminPayoutPage } from "@/types/admin-payout-page.type";
import type { PayoutFilters } from "@/types/payout-filters.type";

export function useAdminPayouts(filters: PayoutFilters): UseQueryResult<AdminPayoutPage> {
  return useListQuery(adminPayoutKeys.list(filters.status ?? "", filters.page), () => fetchAdminPayoutPage(filters));
}
