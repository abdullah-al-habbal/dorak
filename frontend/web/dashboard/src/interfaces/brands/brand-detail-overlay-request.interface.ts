import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

export interface BrandDetailOverlayRequest {
  kind: OverlayKind.BrandDetail;
  brand: AdminBrand;
}
