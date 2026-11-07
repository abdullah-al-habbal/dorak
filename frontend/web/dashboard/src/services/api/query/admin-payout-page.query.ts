import { PAYOUT_PER_PAGE } from "@/config/payout.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { adminPayoutListSchema } from "@/schemas/admin-payout.zod";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { AdminPayoutPage } from "@/types/admin-payout-page.type";
import type { PayoutFilters } from "@/types/payout-filters.type";

export async function fetchAdminPayoutPage(filters: PayoutFilters): Promise<AdminPayoutPage> {
  const params = new URLSearchParams({ per_page: String(PAYOUT_PER_PAGE), page: String(filters.page) });
  if (filters.status) params.set("status", filters.status);
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/payouts?${params.toString()}`, { schema: adminPayoutListSchema });
  const pagination = pageInfoSchema.safeParse((meta as { pagination?: unknown } | null)?.pagination);
  const fallback = { total: data.length, per_page: PAYOUT_PER_PAGE, current_page: filters.page, total_pages: 1 };
  return { items: data, page: pagination.success ? pagination.data : fallback };
}
