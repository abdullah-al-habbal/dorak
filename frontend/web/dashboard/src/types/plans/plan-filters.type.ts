import type { PlanState } from "@/enums/money/plan-state.enum";

export interface PlanFilters {
  state?: PlanState;
  page: number;
}
