import type { BrandLifecycleAction } from "@/enums/venue/brand-lifecycle-action.enum";
import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

export interface BrandReasonOverlayRequest {
  kind: OverlayKind.BrandReason;
  brand: AdminBrand;
  action: BrandLifecycleAction.Reject | BrandLifecycleAction.Suspend;
}
