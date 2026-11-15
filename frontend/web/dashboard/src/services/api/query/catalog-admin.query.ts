import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/resolve-page-info.util";
import { catalogItemListSchema, catalogTagListSchema } from "@/schemas/catalog-item.zod";
import { apiRequest, apiRequestWithMeta } from "@/services/api/core/client";
import type { CatalogItemPage, CatalogTag } from "@/types/services/catalog-item.type";

export const CATALOG_ITEMS_PER_PAGE = 20;

export async function fetchCatalogItemPage(categoryId: string, search: string, page: number): Promise<CatalogItemPage> {
  const params = new URLSearchParams({ page: String(page), per_page: String(CATALOG_ITEMS_PER_PAGE) });
  if (categoryId !== "") params.set("category_id", categoryId);
  if (search !== "") params.set("search", search);
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/catalog-items?${params.toString()}`, { schema: catalogItemListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, CATALOG_ITEMS_PER_PAGE, page) };
}

export function fetchCatalogTags(): Promise<CatalogTag[]> {
  return apiRequest(`${DASHBOARD_API}/admin/catalog-tags`, { schema: catalogTagListSchema });
}
