import type { CatalogCategoryStatus } from "@/enums/catalog-category-status.enum";

export interface AdminCatalogFilters {
  status?: CatalogCategoryStatus;
  search?: string;
}
