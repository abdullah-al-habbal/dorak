import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { CatalogTag } from "@/types/catalog-item.type";

export interface CatalogTagFormOverlayRequest {
  kind: OverlayKind.CatalogTagForm;
  /** Present when editing. */
  tag?: CatalogTag;
}
