import { z } from "zod";

export const BranchReviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  authorName: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string(),
});
