import { z } from "zod";

import { serviceSchema } from "@/schemas/service.zod";

/** A barber's service as one brand sees it (`ServiceResource` with a brand context): the effective terms plus the barber's defaults. */
export const serviceTermsSchema = serviceSchema.extend({
  is_overridden: z.boolean().optional().default(false),
  default_price_amount_minor: z.number().optional(),
  default_duration_minutes: z.number().nullable().optional(),
});

export const serviceTermsListSchema = z.array(serviceTermsSchema);
