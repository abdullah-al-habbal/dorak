import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z.object({
    en: z.string().min(2).max(120),
    ar: z.string().min(2).max(120),
  }),
  price: z.coerce.number().nonnegative(),
  duration: z.coerce.number().int().min(1).max(1440).nullable(),
  currencyId: z.string().uuid(),
  active: z.boolean(),
  atHome: z.boolean(),
  serviceableId: z.string().uuid(),
  serviceableType: z.enum(["brand", "barber"]),
  catalogItemId: z.string().uuid().nullable(),
});
