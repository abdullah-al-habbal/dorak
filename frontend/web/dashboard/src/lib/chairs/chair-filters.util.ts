import { CHAIR_MAX_SEARCH } from "@/config/venue/chair-layout.constant";
import { ChairStatus } from "@/enums/venue/chair-status.enum";
import { FloorZone } from "@/enums/people/floor-zone.enum";
import { parseEnumValue } from "@/lib/core/parse/enum-value.util";
import type { ChairFilters } from "@/types/chairs/chair-filters.type";


export function chairFiltersFromParams(params: URLSearchParams): ChairFilters {
  const status = params.get("status");
  const zone = params.get("zone");
  const page = Number(params.get("page"));
  return {
    search: params.get("search")?.slice(0, CHAIR_MAX_SEARCH) || undefined,
    branchId: params.get("branch") || undefined,
    status: parseEnumValue(ChairStatus, status),
    floorZone: parseEnumValue(FloorZone, zone),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function chairFiltersToParams(filters: ChairFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.branchId) params.set("branch", filters.branchId);
  if (filters.status) params.set("status", filters.status);
  if (filters.floorZone) params.set("zone", filters.floorZone);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** The backend query string for a filter set. */
export function chairQueryString(filters: ChairFilters, perPage: number): string {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(filters.page) });
  if (filters.search) params.set("search", filters.search);
  if (filters.branchId) params.set("branch_id", filters.branchId);
  if (filters.status) params.set("status", filters.status);
  if (filters.floorZone) params.set("floor_zone", filters.floorZone);
  return params.toString();
}
