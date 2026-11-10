import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { ReviewDisputePayload } from "@/interfaces/review-dispute-payload.interface";
import { reviewSchema } from "@/schemas/review.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Review } from "@/types/review.type";

export function disputeReview({ branchId, reviewId, reason }: ReviewDisputePayload): Promise<Review> {
  return apiRequest(`${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/reviews/${encodeURIComponent(reviewId)}/dispute`, {
    method: HttpMethod.Post,
    body: { reason },
    schema: reviewSchema,
  });
}
