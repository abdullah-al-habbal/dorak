import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { Stylist } from "@/types/stylist.type";

export interface StylistPricingOverlayRequest {
  kind: OverlayKind.StylistPricing;
  stylist: Stylist;
}
