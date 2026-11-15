import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminCatalogCategory } from "@/types/services/admin-catalog-category.type";

export interface CatalogCategoryDetailOverlayRequest {
  kind: OverlayKind.CatalogCategoryDetail;
  category: AdminCatalogCategory;
}
