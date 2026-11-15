import type { ServiceFilters } from "@/types/services/service-filters.type";

const MAX_SEARCH = 100;

export function serviceFiltersFromParams(params: URLSearchParams): ServiceFilters {
  return {
    search: params.get("search")?.trim().slice(0, MAX_SEARCH) || undefined,
    brandId: params.get("brand") || undefined,
    page: 1,
  };
}

/** No filters means no params, so the URL falls back to the bare path. */
export function serviceFiltersToParams(filters: ServiceFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.brandId) params.set("brand", filters.brandId);
  return params;
}
