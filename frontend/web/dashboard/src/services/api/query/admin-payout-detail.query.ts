import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/core/resolve-page-info.util";
import { adminPayoutSchema } from "@/schemas/earnings/admin-payout.zod";
import { commissionEntryListSchema } from "@/schemas/earnings/commission.zod";
import { apiRequest, apiRequestWithMeta } from "@/services/api/core/client";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";
import type { CommissionEntryPage } from "@/types/earnings/commission.type";

/** The backend sets the page size from the platform pagination setting. */
const ASSUMED_PER_PAGE = 15;

function payoutPath(id: string): string {
  return `${DASHBOARD_API}/admin/payouts/${encodeURIComponent(id)}`;
}

/** One payout with its approver. */
export function fetchAdminPayout(id: string): Promise<AdminPayout> {
  return apiRequest(payoutPath(id), { schema: adminPayoutSchema });
}

/** The commission entries a payout settles: its lines. */
export async function fetchPayoutEntries(id: string, page: number): Promise<CommissionEntryPage> {
  const { data, meta } = await apiRequestWithMeta(`${payoutPath(id)}/entries?page=${page}`, { schema: commissionEntryListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, ASSUMED_PER_PAGE, page) };
}
