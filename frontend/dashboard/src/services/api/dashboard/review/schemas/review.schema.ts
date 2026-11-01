import { z } from "zod";
import { REVIEW_STATUSES } from "@/services/api/dashboard/review/review.constant";

export const BranchReviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  authorName: z.string().nullable(),
  status: z.enum(REVIEW_STATUSES).nullable(),
  createdAt: z.string(),
});
