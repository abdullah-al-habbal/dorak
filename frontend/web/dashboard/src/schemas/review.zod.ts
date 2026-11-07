import { z } from "zod";

import { ReviewStatus } from "@/enums/review-status.enum";

export const reviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  body: z.string().nullable().optional(),
  status: z.enum(ReviewStatus).nullable().optional(),
  author_name: z.string().nullable().optional(),
  created_at: z.string(),
});

export const reviewListSchema = z.array(reviewSchema);

/** `meta.summary` of the branch reviews endpoint; the distribution is keyed by rating 1 to 5. */
export const reviewSummarySchema = z.object({
  average: z.number().nullable(),
  count: z.number(),
  distribution: z.record(z.string(), z.number()),
});
