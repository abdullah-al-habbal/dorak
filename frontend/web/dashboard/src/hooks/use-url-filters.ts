"use client";

import { useUrlState } from "@/hooks/use-url-state";
import { applyFilterPatch } from "@/lib/url-query.util";

/** URL-backed list filters: `useUrlState` plus the rule that any filter change resets to page 1. */
export function useUrlFilters<F extends { page: number }>(
  fromParams: (params: URLSearchParams) => F,
  toParams: (filters: F) => URLSearchParams,
): { filters: F; update: (patch: Partial<F>) => void } {
  const { value: filters, setValue } = useUrlState(fromParams, toParams);
  const update = (patch: Partial<F>): void => setValue(applyFilterPatch(filters, patch));

  return { filters, update };
}
