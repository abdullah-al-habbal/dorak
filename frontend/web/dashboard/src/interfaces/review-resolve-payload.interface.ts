import type { ReviewStatus } from "@/enums/review-status.enum";

export interface ReviewResolvePayload {
  id: string;
  status: ReviewStatus;
  note?: string;
}
