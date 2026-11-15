import type { AdminReview } from "@/types/clients/admin-review.type";
import type { PageInfo } from "@/types/core/page-info.type";

export interface AdminReviewPage {
  items: AdminReview[];
  page: PageInfo;
}
