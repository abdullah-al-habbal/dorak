"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { adminSubscriptionKeys } from "@/lib/admin-subscription-keys";
import { fetchAdminSubscriptionPage } from "@/services/api/query/admin-subscription-page.query";
import type { AdminSubscriptionFilters } from "@/types/admin-subscription-filters.type";
import type { AdminSubscriptionPage } from "@/types/admin-subscription-page.type";

export function useAdminSubscriptions(filters: AdminSubscriptionFilters): UseQueryResult<AdminSubscriptionPage> {
  return useQuery({
    queryKey: adminSubscriptionKeys.list(filters.status ?? "", filters.page),
    queryFn: () => fetchAdminSubscriptionPage(filters),
    placeholderData: keepPreviousData,
  });
}
