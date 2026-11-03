import { z } from "zod";
import { LocalizedNameSchema } from "@/services/api/dashboard/shared/schemas/dashboard-common.schema";

/** One barber service as a brand charges it, next to the barber's own default. */
export const BarberServiceTermsSchema = z.object({
  id: z.string().min(1),
  name: LocalizedNameSchema,
  currencyCode: z.string(),
  priceAmountMinor: z.number(),
  durationMinutes: z.number().nullable(),
  defaultPriceAmountMinor: z.number(),
  defaultDurationMinutes: z.number().nullable(),
  isOverridden: z.boolean(),
});
