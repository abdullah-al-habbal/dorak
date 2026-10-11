import { z } from "zod";

const localizedName = z.object({
  en: z.string().min(2).max(120),
  ar: z.string().min(2).max(120),
});
const coordinate = z.coerce.number().finite();

export const branchCreateSchema = z.object({
  name: localizedName,
  brandId: z.string().uuid(),
  email: z.string().email().max(255),
  password: z.string().min(12).max(255),
  latitude: coordinate.min(-90).max(90).nullable(),
  longitude: coordinate.min(-180).max(180).nullable(),
  status: z.enum(["pending", "enabled", "disabled"]),
});

export const branchEditSchema = branchCreateSchema.extend({
  password: z.string().min(12).max(255).optional(),
});
