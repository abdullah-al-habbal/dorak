import { ADMIN_CATALOG_MAX_SEARCH } from "@/config/platform/admin-catalog.constant";
import { CatalogCategoryStatus } from "@/enums/venue/catalog-category-status.enum";
import type { AdminCatalogFilters } from "@/types/services/admin-catalog-filters.type";

function toStatus(value: string | null): CatalogCategoryStatus | undefined {
  return Object.values(CatalogCategoryStatus).find((status) => status === value);
}

/** An unknown `status` lists every category; the search is trimmed and capped like the backend rule. */
export function adminCatalogFiltersFromParams(params: URLSearchParams): AdminCatalogFilters {
  return {
    status: toStatus(params.get("status")),
    search: params.get("search")?.trim().slice(0, ADMIN_CATALOG_MAX_SEARCH) || undefined,
  };
}

/** The URL and the backend query share one shape (`status`, `search`). */
export function adminCatalogFiltersToParams(filters: AdminCatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  return params;
}

export function hasAdminCatalogFilters(filters: AdminCatalogFilters): boolean {
  return filters.status !== undefined || filters.search !== undefined;
}
