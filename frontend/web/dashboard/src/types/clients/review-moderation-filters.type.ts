import type { ReviewStatus } from "@/enums/review-status.enum";

export interface ReviewModerationFilters {
  status: ReviewStatus;
  page: number;
}
