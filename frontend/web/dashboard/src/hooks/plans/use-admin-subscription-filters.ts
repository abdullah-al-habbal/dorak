"use client";

import { useUrlFilters } from "@/hooks/core/use-url-filters";
import { adminSubscriptionFiltersFromParams, adminSubscriptionFiltersToParams } from "@/lib/plans/admin-subscription-filters.util";
import type { AdminSubscriptionFilters } from "@/types/plans/admin-subscription-filters.type";

/** The URL is the source of truth for the status filter and page. */
export function useAdminSubscriptionFilters(): { filters: AdminSubscriptionFilters; update: (patch: Partial<AdminSubscriptionFilters>) => void } {
  return useUrlFilters(adminSubscriptionFiltersFromParams, adminSubscriptionFiltersToParams);
}
