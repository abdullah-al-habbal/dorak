import type { z } from "zod";

import type { reviewSchema } from "@/schemas/clients/review.zod";

export type Review = z.infer<typeof reviewSchema>;
