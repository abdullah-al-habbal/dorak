import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { Review } from "@/types/clients/review.type";

export interface ReviewDisputeOverlayRequest {
  kind: OverlayKind.ReviewDispute;
  branchId: string;
  review: Review;
}
