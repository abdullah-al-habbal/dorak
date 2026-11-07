import { PlanState } from "@/enums/plan-state.enum";
import type { PlanFilters } from "@/types/plan-filters.type";

const STATES = new Set<string>(Object.values(PlanState));

export function planFiltersFromParams(params: URLSearchParams): PlanFilters {
  const page = Number(params.get("page"));
  const state = params.get("state") ?? "";
  return {
    state: STATES.has(state) ? (state as PlanState) : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function planFiltersToParams(filters: PlanFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.state) params.set("state", filters.state);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}
