import type { PageInfo } from "@/types/page-info.type";
import type { Plan } from "@/types/plan.type";

export interface PlanPage {
  items: Plan[];
  page: PageInfo;
}
