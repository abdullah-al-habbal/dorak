import { ADMIN_SUBSCRIPTION_PER_PAGE } from "@/config/platform/admin-subscription.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/core/query/resolve-page-info.util";
import { adminSubscriptionListSchema } from "@/schemas/plans/admin-subscription.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { AdminSubscriptionFilters } from "@/types/plans/admin-subscription-filters.type";
import type { AdminSubscriptionPage } from "@/types/plans/admin-subscription-page.type";

export async function fetchAdminSubscriptionPage(filters: AdminSubscriptionFilters): Promise<AdminSubscriptionPage> {
  const params = new URLSearchParams({ per_page: String(ADMIN_SUBSCRIPTION_PER_PAGE), page: String(filters.page) });
  if (filters.status) params.set("status", filters.status);
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/subscriptions?${params.toString()}`, { schema: adminSubscriptionListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, ADMIN_SUBSCRIPTION_PER_PAGE, filters.page) };
}
