import { PLAN_PER_PAGE } from "@/config/plan.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { PlanState } from "@/enums/plan-state.enum";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { planListSchema } from "@/schemas/plan.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { PlanFilters } from "@/types/plan-filters.type";
import type { PlanPage } from "@/types/plan-page.type";

/** `perPage` lets the assign dialog fetch every active plan at once. */
export async function fetchPlanPage(filters: PlanFilters, perPage: number = PLAN_PER_PAGE): Promise<PlanPage> {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(filters.page) });
  if (filters.state) params.set("is_active", filters.state === PlanState.Active ? "1" : "0");
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/subscription-plans?${params.toString()}`, { schema: planListSchema });
  const pagination = pageInfoSchema.safeParse((meta as { pagination?: unknown } | null)?.pagination);
  const fallback = { total: data.length, per_page: perPage, current_page: filters.page, total_pages: 1 };
  return { items: data, page: pagination.success ? pagination.data : fallback };
}
