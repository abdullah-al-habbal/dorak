import { z } from "zod";

import { CLIENT_RATING_BODY_MAX, CLIENT_RATING_MAX, CLIENT_RATING_MIN } from "@/config/venue/client-rating.constant";

/** Zero means no star chosen yet, which the range check rejects. */
export function createRateClientFormSchema(messages: { ratingRequired: string }) {
  return z.object({
    rating: z.number().int(messages.ratingRequired).min(CLIENT_RATING_MIN, messages.ratingRequired).max(CLIENT_RATING_MAX, messages.ratingRequired),
    body: z.string().max(CLIENT_RATING_BODY_MAX),
  });
}
