import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminReview } from "@/types/clients/admin-review.type";

export interface ReviewResolveOverlayRequest {
  kind: OverlayKind.ReviewResolve;
  review: AdminReview;
}
