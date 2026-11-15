import { ALL_BRANDS, SETTLED_ALL, SETTLED_YES } from "@/config/commission.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/core/resolve-page-info.util";
import { commissionEntryListSchema, commissionRuleListSchema } from "@/schemas/earnings/commission.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { CommissionEntryPage, CommissionRulePage } from "@/types/earnings/commission.type";

/** The backend sets the page size from the platform pagination setting. */
const ASSUMED_PER_PAGE = 15;

export async function fetchCommissionRules(page: number): Promise<CommissionRulePage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/commission-rules?page=${page}`, { schema: commissionRuleListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, ASSUMED_PER_PAGE, page) };
}

export async function fetchCommissionEntries(brandId: string, settled: string, page: number): Promise<CommissionEntryPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (brandId !== ALL_BRANDS) params.set("brand_id", brandId);
  if (settled !== SETTLED_ALL) params.set("settled", settled === SETTLED_YES ? "1" : "0");
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/commission-entries?${params.toString()}`, { schema: commissionEntryListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, ASSUMED_PER_PAGE, page) };
}
