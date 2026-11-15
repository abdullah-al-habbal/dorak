import type { z } from "zod";

import type { reviewSummarySchema } from "@/schemas/clients/review.zod";

export type ReviewSummary = z.infer<typeof reviewSummarySchema>;
