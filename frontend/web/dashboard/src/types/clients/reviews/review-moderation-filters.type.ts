import type { ReviewStatus } from "@/enums/people/review-status.enum";

export interface ReviewModerationFilters {
  status: ReviewStatus;
  page: number;
}
