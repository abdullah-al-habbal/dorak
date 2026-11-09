import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminCatalogCategory } from "@/types/admin-catalog-category.type";

export interface CatalogCategoryFormOverlayRequest {
  kind: OverlayKind.CatalogCategoryForm;
  /** Present when editing an existing category. */
  category?: AdminCatalogCategory;
}
