import { BRANCH_MAX_SEARCH } from "@/config/venue/branch.constant";
import { BranchStatus } from "@/enums/venue/branch-status.enum";
import { parseEnumValue } from "@/lib/core/parse/enum-value.util";
import type { BranchFilters } from "@/types/branches/branch-filters.type";


export function branchFiltersFromParams(params: URLSearchParams): BranchFilters {
  const status = params.get("status");
  const page = Number(params.get("page"));
  return {
    search: params.get("search")?.slice(0, BRANCH_MAX_SEARCH) || undefined,
    brandId: params.get("brand") || undefined,
    status: parseEnumValue(BranchStatus, status),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function branchFiltersToParams(filters: BranchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.brandId) params.set("brand", filters.brandId);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** The backend query string for a filter set. */
export function branchQueryString(filters: BranchFilters, perPage: number): string {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(filters.page) });
  if (filters.search) params.set("search", filters.search);
  if (filters.brandId) params.set("brand_id", filters.brandId);
  if (filters.status) params.set("status", filters.status);
  return params.toString();
}
