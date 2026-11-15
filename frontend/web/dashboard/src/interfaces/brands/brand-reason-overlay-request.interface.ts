import type { BrandLifecycleAction } from "@/enums/brand-lifecycle-action.enum";
import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

export interface BrandReasonOverlayRequest {
  kind: OverlayKind.BrandReason;
  brand: AdminBrand;
  action: BrandLifecycleAction.Reject | BrandLifecycleAction.Suspend;
}
