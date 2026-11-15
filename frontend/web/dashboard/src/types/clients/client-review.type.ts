import type { z } from "zod";

import type { clientReviewSchema } from "@/schemas/admin-client.zod";

export type ClientReview = z.infer<typeof clientReviewSchema>;
