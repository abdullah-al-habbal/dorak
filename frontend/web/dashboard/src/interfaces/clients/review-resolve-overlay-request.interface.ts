import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { AdminReview } from "@/types/clients/reviews/admin-review.type";

export interface ReviewResolveOverlayRequest {
  kind: OverlayKind.ReviewResolve;
  review: AdminReview;
}
