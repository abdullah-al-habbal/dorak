import type { z } from "zod";
import type { BranchReviewSchema } from "@/services/api/dashboard/review/schemas/review.schema";

export type IBranchReview = z.infer<typeof BranchReviewSchema>;
