import { z } from "zod";

export const bookingClientReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().max(1000).optional(),
});
