import type { PageInfo } from "@/types/core/page-info.type";
import type { Plan } from "@/types/plans/plan.type";

export interface PlanPage {
  items: Plan[];
  page: PageInfo;
}
