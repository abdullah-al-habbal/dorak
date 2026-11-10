import type { AdminReview } from "@/types/admin-review.type";
import type { PageInfo } from "@/types/page-info.type";

export interface AdminReviewPage {
  items: AdminReview[];
  page: PageInfo;
}
