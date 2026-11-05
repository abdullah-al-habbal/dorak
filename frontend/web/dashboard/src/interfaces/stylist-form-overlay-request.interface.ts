import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { Stylist } from "@/types/stylist.type";

export interface StylistFormOverlayRequest {
  kind: OverlayKind.StylistForm;
  /** Present when editing an existing stylist. */
  stylist?: Stylist;
}
