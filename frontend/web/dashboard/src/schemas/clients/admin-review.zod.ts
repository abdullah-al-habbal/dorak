import { z } from "zod";

import { ReviewStatus } from "@/enums/review-status.enum";

/** `GET /admin/reviews` and the resolve answer (`AdminReviewResource`). */
export const adminReviewSchema = z.object({
  id: z.string(),
  subject_type: z.string().nullable().optional(),
  subject_name: z.string().nullable().optional(),
  rating: z.number(),
  body: z.string().nullable().optional(),
  status: z.enum(ReviewStatus).nullable().optional(),
  author_name: z.string().nullable().optional(),
  dispute_reason: z.string().nullable().optional(),
  resolution_note: z.string().nullable().optional(),
  disputed_at: z.string().nullable().optional(),
  resolved_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export const adminReviewListSchema = z.array(adminReviewSchema);
