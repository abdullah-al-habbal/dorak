import type { PageInfo } from "@/types/page-info.type";
import type { ReviewSummary } from "@/types/review-summary.type";
import type { Review } from "@/types/review.type";

export interface ReviewPage {
  items: Review[];
  page: PageInfo;
  summary: ReviewSummary;
}
