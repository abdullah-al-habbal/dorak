import { REVIEW_RATINGS_DESC } from "@/config/review.constant";
import type { ReviewSummary } from "@/types/clients/review-summary.type";

export interface RatingBar {
  rating: number;
  count: number;
  /** 0 to 100, relative to all counted reviews. */
  percent: number;
}

/** One bar per rating, highest first; a branch without reviews yields empty bars. */
export function ratingBars(summary: ReviewSummary): RatingBar[] {
  return REVIEW_RATINGS_DESC.map((rating) => {
    const count = summary.distribution[String(rating)] ?? 0;
    return { rating, count, percent: summary.count === 0 ? 0 : Math.round((count / summary.count) * 100) };
  });
}
