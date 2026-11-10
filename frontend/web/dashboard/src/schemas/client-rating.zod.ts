import { z } from "zod";

import { CLIENT_RATING_BODY_MAX, CLIENT_RATING_MAX, CLIENT_RATING_MIN } from "@/config/client-rating.constant";

/** The shop's rating of a client, as the booking payload carries it (`client_review`). */
export const clientRatingSchema = z.object({
  rating: z.number(),
  body: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

/** `POST /bookings/{id}/review` body. */
export const clientRatingInputSchema = z.object({
  rating: z.number().int().min(CLIENT_RATING_MIN).max(CLIENT_RATING_MAX),
  body: z.string().trim().max(CLIENT_RATING_BODY_MAX).optional(),
});
