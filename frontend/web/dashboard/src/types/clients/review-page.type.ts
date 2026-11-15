import type { PageInfo } from "@/types/core/page-info.type";
import type { ReviewSummary } from "@/types/clients/review-summary.type";
import type { Review } from "@/types/clients/review.type";

export interface ReviewPage {
  items: Review[];
  page: PageInfo;
  summary: ReviewSummary;
}
