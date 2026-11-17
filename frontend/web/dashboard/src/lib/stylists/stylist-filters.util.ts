import { BarberStatus } from "@/enums/people/barber-status.enum";
import { parseEnumValue } from "@/lib/core/parse/enum-value.util";
import type { StylistFilters } from "@/types/stylists/stylist-filters.type";

const MAX_SEARCH = 100;

export function filtersFromParams(params: URLSearchParams): StylistFilters {
  const status = params.get("status");
  const page = Number(params.get("page"));
  return {
    search: params.get("search")?.slice(0, MAX_SEARCH) || undefined,
    chairId: params.get("chair") || undefined,
    branchId: params.get("branch") || undefined,
    status: parseEnumValue(BarberStatus, status),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function filtersToParams(filters: StylistFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.chairId) params.set("chair", filters.chairId);
  if (filters.branchId) params.set("branch", filters.branchId);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}
