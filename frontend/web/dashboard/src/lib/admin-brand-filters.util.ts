import { ADMIN_BRAND_MAX_SEARCH, BRAND_STATUS_FILTER_ALL, DEFAULT_BRAND_STATUS_FILTER } from "@/config/admin-brand.constant";
import { BrandStatus } from "@/enums/brand-status.enum";
import type { AdminBrandFilters } from "@/types/brands/admin-brand-filters.type";
import type { BrandStatusFilter } from "@/types/brands/brand-status-filter.type";

const STATUS_FILTERS = new Set<string>([...Object.values(BrandStatus), BRAND_STATUS_FILTER_ALL]);

function isStatusFilter(value: string): value is BrandStatusFilter {
  return STATUS_FILTERS.has(value);
}

/** A bare or unknown `status` opens the pending queue; `status=all` lists every brand. */
export function adminBrandFiltersFromParams(params: URLSearchParams): AdminBrandFilters {
  const status = params.get("status") ?? "";
  const page = Number(params.get("page"));
  return {
    status: isStatusFilter(status) ? status : DEFAULT_BRAND_STATUS_FILTER,
    search: params.get("search")?.trim().slice(0, ADMIN_BRAND_MAX_SEARCH) || undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function adminBrandFiltersToParams(filters: AdminBrandFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status !== DEFAULT_BRAND_STATUS_FILTER) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** The backend query string: `all` sends no status. */
export function adminBrandQueryString(filters: AdminBrandFilters, perPage: number): string {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(filters.page) });
  if (filters.status !== BRAND_STATUS_FILTER_ALL) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  return params.toString();
}

/** True when the view differs from the default pending queue, so an empty list offers "Clear filters". */
export function hasAdminBrandFilters(filters: AdminBrandFilters): boolean {
  return filters.status !== DEFAULT_BRAND_STATUS_FILTER || filters.search !== undefined;
}
