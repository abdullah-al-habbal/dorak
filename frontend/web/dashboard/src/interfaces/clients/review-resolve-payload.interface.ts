import type { ReviewStatus } from "@/enums/people/review-status.enum";

export interface ReviewResolvePayload {
  id: string;
  status: ReviewStatus;
  note?: string;
}
