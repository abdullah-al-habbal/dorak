import { DASHBOARD_API } from "@/config/routes.constant";
import { adminCatalogFiltersToParams } from "@/lib/admin-catalog-filters.util";
import { adminCatalogCategoryListSchema } from "@/schemas/admin-catalog-category.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminCatalogCategory } from "@/types/services/admin-catalog-category.type";
import type { AdminCatalogFilters } from "@/types/services/admin-catalog-filters.type";

/** The whole taxonomy in one response (not paginated): top-level categories with counts and subcategories. */
export function fetchAdminCatalogCategories(filters: AdminCatalogFilters): Promise<AdminCatalogCategory[]> {
  const query = adminCatalogFiltersToParams(filters).toString();
  return apiRequest(`${DASHBOARD_API}/admin/catalog-categories${query ? `?${query}` : ""}`, { schema: adminCatalogCategoryListSchema });
}
