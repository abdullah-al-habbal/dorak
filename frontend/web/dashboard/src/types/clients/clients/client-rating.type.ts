import type { z } from "zod";

import type { clientRatingInputSchema } from "@/schemas/clients/client-rating.zod";

export type ClientRatingInput = z.infer<typeof clientRatingInputSchema>;
