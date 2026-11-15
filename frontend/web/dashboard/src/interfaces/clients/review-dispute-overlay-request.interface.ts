import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { Review } from "@/types/clients/reviews/review.type";

export interface ReviewDisputeOverlayRequest {
  kind: OverlayKind.ReviewDispute;
  branchId: string;
  review: Review;
}
