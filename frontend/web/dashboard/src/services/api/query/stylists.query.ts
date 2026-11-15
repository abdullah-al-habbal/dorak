import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/core/resolve-page-info.util";
import { stylistListSchema } from "@/schemas/stylist.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { StylistFilters } from "@/types/stylists/stylist-filters.type";
import type { StylistPage } from "@/types/stylists/stylist-page.type";

const PER_PAGE = 20;

function queryString(filters: StylistFilters): string {
  const params = new URLSearchParams({ per_page: String(PER_PAGE), page: String(filters.page) });
  if (filters.search) params.set("search", filters.search);
  if (filters.chairId) params.set("chair_id", filters.chairId);
  if (filters.branchId) params.set("branch_id", filters.branchId);
  if (filters.status) params.set("status", filters.status);
  return params.toString();
}

export async function fetchStylistPage(filters: StylistFilters): Promise<StylistPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/stylists?${queryString(filters)}`, { schema: stylistListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, PER_PAGE, filters.page) };
}
