import { FIRST_PAGE } from "@/lib/core/query/pagination.util";

const PAGE_KEY = "page";

/** The href a query write replaces the current entry with; an empty query leaves the bare pathname. */
export function toReplaceHref(pathname: string, query: string): string {
  return query ? `${pathname}?${query}` : pathname;
}

/** Merges a filter patch; any change other than the page itself sends the list back to page 1. */
export function applyFilterPatch<F extends { page: number }>(filters: F, patch: Partial<F>): F {
  const resetsPage = Object.keys(patch).some((key) => key !== PAGE_KEY);
  return { ...filters, ...(resetsPage ? { page: FIRST_PAGE } : {}), ...patch };
}
