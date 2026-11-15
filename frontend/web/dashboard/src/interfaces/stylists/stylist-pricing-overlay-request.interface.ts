import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { Stylist } from "@/types/stylists/stylist.type";

export interface StylistPricingOverlayRequest {
  kind: OverlayKind.StylistPricing;
  stylist: Stylist;
}
