import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminCatalogCategory } from "@/types/admin-catalog-category.type";

export interface CatalogCategoryDetailOverlayRequest {
  kind: OverlayKind.CatalogCategoryDetail;
  category: AdminCatalogCategory;
}
