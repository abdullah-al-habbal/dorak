import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { CatalogItem } from "@/types/services/catalog-item.type";

export interface CatalogItemFormOverlayRequest {
  kind: OverlayKind.CatalogItemForm;
  /** Present when editing. */
  item?: CatalogItem;
}
