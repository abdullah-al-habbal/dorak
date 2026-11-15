import { ADMIN_USER_MAX_SEARCH, DEFAULT_ADMIN_USER_STATE } from "@/config/platform/admin-user.constant";
import { AdminUserState } from "@/enums/access/admin-user-state.enum";
import type { AdminUserFilters } from "@/types/platform/admin-user-filters.type";

const STATES = new Set<string>(Object.values(AdminUserState));

function isState(value: string): value is AdminUserState {
  return STATES.has(value);
}

export function adminUserFiltersFromParams(params: URLSearchParams): AdminUserFilters {
  const state = params.get("state") ?? "";
  const page = Number(params.get("page"));
  return {
    state: isState(state) ? state : DEFAULT_ADMIN_USER_STATE,
    search: params.get("search")?.trim().slice(0, ADMIN_USER_MAX_SEARCH) || undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function adminUserFiltersToParams(filters: AdminUserFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.state !== DEFAULT_ADMIN_USER_STATE) params.set("state", filters.state);
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** The backend query string: `all` sends no `active` filter. */
export function adminUserQueryString(filters: AdminUserFilters, perPage: number): string {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(filters.page) });
  if (filters.state !== AdminUserState.All) params.set("active", filters.state === AdminUserState.Active ? "1" : "0");
  if (filters.search) params.set("search", filters.search);
  return params.toString();
}

export function hasAdminUserFilters(filters: AdminUserFilters): boolean {
  return filters.state !== DEFAULT_ADMIN_USER_STATE || filters.search !== undefined;
}
