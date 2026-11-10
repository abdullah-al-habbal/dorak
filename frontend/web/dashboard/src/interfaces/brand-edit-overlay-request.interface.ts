import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminBrand } from "@/types/admin-brand.type";

export interface BrandEditOverlayRequest {
  kind: OverlayKind.BrandEdit;
  brand: AdminBrand;
}
