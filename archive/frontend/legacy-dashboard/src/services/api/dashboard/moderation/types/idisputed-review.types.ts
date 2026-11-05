import type { z } from "zod";
import type { DisputedReviewSchema } from "@/services/api/dashboard/moderation/schemas/moderation.schema";

export type IDisputedReview = z.infer<typeof DisputedReviewSchema>;
