import { z } from "zod";

import { localizedTextSchema } from "@/schemas/core/localized-text.zod";

const categorySchema = z.object({ id: z.string(), name: localizedTextSchema.nullable().optional() }).nullable().optional();

export const serviceSchema = z.object({
  id: z.string(),
  name: localizedTextSchema.nullable().optional(),
  name_translations: z.record(z.string(), z.string().nullable()).optional(),
  serviceable_id: z.string(),
  serviceable_type: z.string(),
  catalog_item_id: z.string().nullable().optional(),
  price_amount_minor: z.number(),
  currency_code: z.string(),
  duration_minutes: z.number().nullable().optional(),
  is_at_home: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
  category: categorySchema,
});

export const serviceListSchema = z.array(serviceSchema);
