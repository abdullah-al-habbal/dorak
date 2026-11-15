import type { z } from "zod";

import type { clientRatingInputSchema, clientRatingSchema } from "@/schemas/clients/client-rating.zod";

export type ClientRating = z.infer<typeof clientRatingSchema>;
export type ClientRatingInput = z.infer<typeof clientRatingInputSchema>;
