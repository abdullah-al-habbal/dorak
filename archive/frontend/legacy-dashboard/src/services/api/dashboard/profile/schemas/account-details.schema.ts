import { z } from "zod";

export const updateDisplayNameSchema = z.object({
  displayName: z.string().min(1),
});

export const requestEmailChangeSchema = z.object({
  email: z.string().email(),
});

export const verifyEmailChangeSchema = z.object({
  code: z.string().length(6),
});
