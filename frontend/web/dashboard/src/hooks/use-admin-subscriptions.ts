"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { adminSubscriptionKeys } from "@/lib/query-keys/plans/admin-subscription-keys";
import { fetchAdminSubscriptionPage } from "@/services/api/query/admin-subscription-page.query";
import type { AdminSubscriptionFilters } from "@/types/plans/admin-subscription-filters.type";
import type { AdminSubscriptionPage } from "@/types/plans/admin-subscription-page.type";

export function useAdminSubscriptions(filters: AdminSubscriptionFilters): UseQueryResult<AdminSubscriptionPage> {
  return useListQuery(adminSubscriptionKeys.list(filters.status ?? "", filters.page), () => fetchAdminSubscriptionPage(filters));
}
