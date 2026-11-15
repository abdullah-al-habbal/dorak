import { z } from "zod";

export const apiSuccessBodySchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.unknown(),
  meta: z.unknown().optional(),
});
