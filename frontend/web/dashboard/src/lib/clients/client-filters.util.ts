import { CLIENT_MAX_SEARCH, CLIENT_STATUS_FILTER_ALL } from "@/config/venue/client.constant";
import { ClientBanFilter } from "@/enums/people/client-ban-filter.enum";
import { ClientStatus } from "@/enums/people/client-status.enum";
import type { ClientFilters } from "@/types/clients/clients/client-filters.type";

function parseStatus(value: string | null): ClientFilters["status"] {
  return Object.values(ClientStatus).find((status) => status === value) ?? CLIENT_STATUS_FILTER_ALL;
}

function parseBan(value: string | null): ClientBanFilter {
  return Object.values(ClientBanFilter).find((filter) => filter === value) ?? ClientBanFilter.All;
}

export function clientFiltersFromParams(params: URLSearchParams): ClientFilters {
  const page = Number(params.get("page"));
  return {
    status: parseStatus(params.get("status")),
    banned: parseBan(params.get("banned")),
    search: params.get("search")?.trim().slice(0, CLIENT_MAX_SEARCH) || undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function clientFiltersToParams(filters: ClientFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status !== CLIENT_STATUS_FILTER_ALL) params.set("status", filters.status);
  if (filters.banned !== ClientBanFilter.All) params.set("banned", filters.banned);
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** The backend query string: `all` sends no status, and the ban filter becomes a boolean. */
export function clientQueryString(filters: ClientFilters, perPage: number): string {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(filters.page) });
  if (filters.status !== CLIENT_STATUS_FILTER_ALL) params.set("status", filters.status);
  if (filters.banned !== ClientBanFilter.All) params.set("banned", filters.banned === ClientBanFilter.Banned ? "1" : "0");
  if (filters.search) params.set("search", filters.search);
  return params.toString();
}

export function hasClientFilters(filters: ClientFilters): boolean {
  return filters.status !== CLIENT_STATUS_FILTER_ALL || filters.banned !== ClientBanFilter.All || filters.search !== undefined;
}
