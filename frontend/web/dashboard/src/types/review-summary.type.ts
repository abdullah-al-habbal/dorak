import type { z } from "zod";

import type { reviewSummarySchema } from "@/schemas/review.zod";

export type ReviewSummary = z.infer<typeof reviewSummarySchema>;
