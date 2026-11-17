import { PlanState } from "@/enums/money/plan-state.enum";
import { parseEnumValue } from "@/lib/core/parse/enum-value.util";
import type { PlanFilters } from "@/types/plans/plan-filters.type";


export function planFiltersFromParams(params: URLSearchParams): PlanFilters {
  const page = Number(params.get("page"));
  const state = params.get("state") ?? "";
  return {
    state: parseEnumValue(PlanState, state),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function planFiltersToParams(filters: PlanFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.state) params.set("state", filters.state);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}
