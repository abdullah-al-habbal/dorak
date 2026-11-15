import type { PlanState } from "@/enums/plan-state.enum";

export interface PlanFilters {
  state?: PlanState;
  page: number;
}
