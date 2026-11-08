import { ADMIN_BRAND_PER_PAGE } from "@/config/admin-brand.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { adminBrandQueryString } from "@/lib/admin-brand-filters.util";
import { resolvePageInfo } from "@/lib/resolve-page-info.util";
import { adminBrandListSchema } from "@/schemas/admin-brand.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { AdminBrandFilters } from "@/types/admin-brand-filters.type";
import type { AdminBrandPage } from "@/types/admin-brand-page.type";

export async function fetchAdminBrandPage(filters: AdminBrandFilters): Promise<AdminBrandPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/brands?${adminBrandQueryString(filters, ADMIN_BRAND_PER_PAGE)}`, { schema: adminBrandListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, ADMIN_BRAND_PER_PAGE, filters.page) };
}
