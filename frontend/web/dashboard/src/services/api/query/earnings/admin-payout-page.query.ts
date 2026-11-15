import { PAYOUT_PER_PAGE } from "@/config/money-shell/payout.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/core/query/resolve-page-info.util";
import { adminPayoutListSchema } from "@/schemas/earnings/admin-payout.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { AdminPayoutPage } from "@/types/earnings/admin-payout-page.type";
import type { PayoutFilters } from "@/types/earnings/payout-filters.type";

export async function fetchAdminPayoutPage(filters: PayoutFilters): Promise<AdminPayoutPage> {
  const params = new URLSearchParams({ per_page: String(PAYOUT_PER_PAGE), page: String(filters.page) });
  if (filters.status) params.set("status", filters.status);
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/payouts?${params.toString()}`, { schema: adminPayoutListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, PAYOUT_PER_PAGE, filters.page) };
}
