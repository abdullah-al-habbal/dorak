"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { payoutFiltersFromParams, payoutFiltersToParams } from "@/lib/payout-filters.util";
import type { PayoutFilters } from "@/types/payout-filters.type";

/** The URL is the source of truth for the status and page. */
export function usePayoutFilters(): { filters: PayoutFilters; update: (patch: Partial<PayoutFilters>) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => payoutFiltersFromParams(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<PayoutFilters>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const query = payoutFiltersToParams({ ...filters, ...(resetsPage ? { page: 1 } : {}), ...patch }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, update };
}
