import { z } from "zod";

import { BarberStatus } from "@/enums/barber-status.enum";
import { localizedTextSchema } from "@/schemas/core/localized-text.zod";

const stylistChairSchema = z
  .object({ id: z.string(), label: localizedTextSchema.nullable().optional(), branch_id: z.string().nullable().optional() })
  .nullable()
  .optional();

export const stylistSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  name_translations: z.record(z.string(), z.string().nullable()).optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  status: z.enum(BarberStatus),
  rating_average: z.number().nullable().optional(),
  rating_count: z.number().optional().default(0),
  chair: stylistChairSchema,
});

export const stylistListSchema = z.array(stylistSchema);
