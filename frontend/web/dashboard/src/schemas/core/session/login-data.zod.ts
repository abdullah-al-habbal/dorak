import { z } from "zod";

export const loginDataSchema = z.object({
  claim: z.string().min(1),
  expires_in: z.number().int().positive(),
  token: z.string().min(1),
  refresh_token: z.string().min(1),
  refresh_expires_in: z.number().int().positive(),
});
