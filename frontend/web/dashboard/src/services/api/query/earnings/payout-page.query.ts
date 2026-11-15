import { PAYOUT_PER_PAGE } from "@/config/money-shell/payout.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/core/query/resolve-page-info.util";
import { payoutListSchema } from "@/schemas/earnings/payout.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { PayoutFilters } from "@/types/earnings/payout-filters.type";
import type { PayoutPage } from "@/types/earnings/payout-page.type";

export async function fetchPayoutPage(filters: PayoutFilters): Promise<PayoutPage> {
  const params = new URLSearchParams({ per_page: String(PAYOUT_PER_PAGE), page: String(filters.page) });
  if (filters.status) params.set("status", filters.status);
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/payouts?${params.toString()}`, { schema: payoutListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, PAYOUT_PER_PAGE, filters.page) };
}
