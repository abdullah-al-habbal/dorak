import { z } from "zod";

export const apiFailureBodySchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z.object({
    code: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
