"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { adminSubscriptionFiltersFromParams, adminSubscriptionFiltersToParams } from "@/lib/admin-subscription-filters.util";
import type { AdminSubscriptionFilters } from "@/types/admin-subscription-filters.type";

/** The URL is the source of truth for the status filter and page. */
export function useAdminSubscriptionFilters(): { filters: AdminSubscriptionFilters; update: (patch: Partial<AdminSubscriptionFilters>) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => adminSubscriptionFiltersFromParams(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<AdminSubscriptionFilters>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const query = adminSubscriptionFiltersToParams({ ...filters, ...(resetsPage ? { page: 1 } : {}), ...patch }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, update };
}
