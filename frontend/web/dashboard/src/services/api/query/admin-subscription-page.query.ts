import { ADMIN_SUBSCRIPTION_PER_PAGE } from "@/config/admin-subscription.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { adminSubscriptionListSchema } from "@/schemas/admin-subscription.zod";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { AdminSubscriptionFilters } from "@/types/admin-subscription-filters.type";
import type { AdminSubscriptionPage } from "@/types/admin-subscription-page.type";

export async function fetchAdminSubscriptionPage(filters: AdminSubscriptionFilters): Promise<AdminSubscriptionPage> {
  const params = new URLSearchParams({ per_page: String(ADMIN_SUBSCRIPTION_PER_PAGE), page: String(filters.page) });
  if (filters.status) params.set("status", filters.status);
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/subscriptions?${params.toString()}`, { schema: adminSubscriptionListSchema });
  const pagination = pageInfoSchema.safeParse((meta as { pagination?: unknown } | null)?.pagination);
  const fallback = { total: data.length, per_page: ADMIN_SUBSCRIPTION_PER_PAGE, current_page: filters.page, total_pages: 1 };
  return { items: data, page: pagination.success ? pagination.data : fallback };
}
