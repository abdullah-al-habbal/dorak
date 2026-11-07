"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

const FIRST_PAGE = 1;

/** The URL is the source of truth: parse filters from it and write patches back, resetting to page 1 on any filter change. */
export function useUrlFilters<F extends { page: number }>(
  fromParams: (params: URLSearchParams) => F,
  toParams: (filters: F) => URLSearchParams,
): { filters: F; update: (patch: Partial<F>) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => fromParams(new URLSearchParams(params.toString())), [fromParams, params]);

  const update = useCallback(
    (patch: Partial<F>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const query = toParams({ ...filters, ...(resetsPage ? { page: FIRST_PAGE } : {}), ...patch }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router, toParams],
  );

  return { filters, update };
}
