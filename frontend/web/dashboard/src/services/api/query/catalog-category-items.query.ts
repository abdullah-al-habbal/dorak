import { CATALOG_ITEMS_PREVIEW_PER_PAGE } from "@/config/admin-catalog.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/core/resolve-page-info.util";
import { catalogItemPreviewListSchema } from "@/schemas/catalog-item-preview.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { CatalogItemsPreview } from "@/types/services/catalog-items-preview.type";

const FIRST_PAGE = 1;

/** The first page of a category's catalog items, inactive ones included (admin session). */
export async function fetchCatalogCategoryItems(categoryId: string): Promise<CatalogItemsPreview> {
  const params = new URLSearchParams({ category_id: categoryId, per_page: String(CATALOG_ITEMS_PREVIEW_PER_PAGE) });
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/catalog-items?${params.toString()}`, { schema: catalogItemPreviewListSchema });
  return { items: data, total: resolvePageInfo(meta, data.length, CATALOG_ITEMS_PREVIEW_PER_PAGE, FIRST_PAGE).total };
}
