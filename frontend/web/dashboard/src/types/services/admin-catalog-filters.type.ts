import type { CatalogCategoryStatus } from "@/enums/venue/catalog-category-status.enum";

export interface AdminCatalogFilters {
  status?: CatalogCategoryStatus;
  search?: string;
}
