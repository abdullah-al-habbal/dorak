import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { CatalogTag } from "@/types/services/catalog-item.type";

export interface CatalogTagFormOverlayRequest {
  kind: OverlayKind.CatalogTagForm;
  /** Present when editing. */
  tag?: CatalogTag;
}
