import type { PageInfo } from "@/types/core/shared/page-info.type";
import type { ReviewSummary } from "@/types/clients/reviews/review-summary.type";
import type { Review } from "@/types/clients/reviews/review.type";

export interface ReviewPage {
  items: Review[];
  page: PageInfo;
  summary: ReviewSummary;
}
