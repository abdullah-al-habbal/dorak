import type { AdminReview } from "@/types/clients/reviews/admin-review.type";
import type { PageInfo } from "@/types/core/shared/page-info.type";

export interface AdminReviewPage {
  items: AdminReview[];
  page: PageInfo;
}
