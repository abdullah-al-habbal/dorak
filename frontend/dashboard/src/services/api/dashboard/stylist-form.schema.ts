import { z } from "zod";

const baseSchema = z.object({
  name: z.object({
    en: z.string().min(2).max(120),
    ar: z.string().min(2).max(120),
  }),
  email: z.string().email().max(255),
  phone: z.string().min(7).max(30).nullable(),
  chairId: z.string().uuid().nullable(),
  status: z.enum(["pending", "enabled", "disabled"]),
});

export const stylistCreateSchema = baseSchema.extend({
  password: z.string().min(12).max(255),
});
export const stylistEditSchema = baseSchema.extend({
  password: z.string().min(12).max(255).optional(),
});
