import { PLAN_PER_PAGE } from "@/config/plan.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { PlanState } from "@/enums/plan-state.enum";
import { resolvePageInfo } from "@/lib/core/resolve-page-info.util";
import { planListSchema } from "@/schemas/plan.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { PlanFilters } from "@/types/plans/plan-filters.type";
import type { PlanPage } from "@/types/plans/plan-page.type";

/** `perPage` lets the assign dialog fetch every active plan at once. */
export async function fetchPlanPage(filters: PlanFilters, perPage: number = PLAN_PER_PAGE): Promise<PlanPage> {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(filters.page) });
  if (filters.state) params.set("is_active", filters.state === PlanState.Active ? "1" : "0");
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/subscription-plans?${params.toString()}`, { schema: planListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, perPage, filters.page) };
}
