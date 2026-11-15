import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

export interface BrandEditOverlayRequest {
  kind: OverlayKind.BrandEdit;
  brand: AdminBrand;
}
