"use client";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { payoutFiltersFromParams, payoutFiltersToParams } from "@/lib/payout-filters.util";
import type { PayoutFilters } from "@/types/payout-filters.type";

/** The URL is the source of truth for the status and page. */
export function usePayoutFilters(): { filters: PayoutFilters; update: (patch: Partial<PayoutFilters>) => void } {
  return useUrlFilters(payoutFiltersFromParams, payoutFiltersToParams);
}
