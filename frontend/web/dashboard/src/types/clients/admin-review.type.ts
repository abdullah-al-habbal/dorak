import type { z } from "zod";

import type { adminReviewSchema } from "@/schemas/admin-review.zod";

export type AdminReview = z.infer<typeof adminReviewSchema>;
