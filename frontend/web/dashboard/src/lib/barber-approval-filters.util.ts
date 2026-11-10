import { BARBER_APPROVAL_MAX_SEARCH, BARBER_STATUS_FILTER_ALL, DEFAULT_BARBER_STATUS_FILTER } from "@/config/barber-approval.constant";
import { BarberStatus } from "@/enums/barber-status.enum";
import type { BarberApprovalFilters } from "@/types/barber-approval-filters.type";
import type { BarberStatusFilter } from "@/types/barber-status-filter.type";

const STATUS_FILTERS = new Set<string>([...Object.values(BarberStatus), BARBER_STATUS_FILTER_ALL]);

function isStatusFilter(value: string): value is BarberStatusFilter {
  return STATUS_FILTERS.has(value);
}

/** A bare or unknown `status` opens the pending queue; `status=all` lists every barber. */
export function barberApprovalFiltersFromParams(params: URLSearchParams): BarberApprovalFilters {
  const status = params.get("status") ?? "";
  const page = Number(params.get("page"));
  return {
    status: isStatusFilter(status) ? status : DEFAULT_BARBER_STATUS_FILTER,
    search: params.get("search")?.trim().slice(0, BARBER_APPROVAL_MAX_SEARCH) || undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function barberApprovalFiltersToParams(filters: BarberApprovalFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status !== DEFAULT_BARBER_STATUS_FILTER) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** The backend query string: `all` sends no status. */
export function barberApprovalQueryString(filters: BarberApprovalFilters, perPage: number): string {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(filters.page) });
  if (filters.status !== BARBER_STATUS_FILTER_ALL) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  return params.toString();
}

export function hasBarberApprovalFilters(filters: BarberApprovalFilters): boolean {
  return filters.status !== DEFAULT_BARBER_STATUS_FILTER || filters.search !== undefined;
}
