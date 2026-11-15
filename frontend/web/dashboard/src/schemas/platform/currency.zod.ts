import { z } from "zod";

import { localizedTextSchema } from "@/schemas/core/api/localized-text.zod";

export const currencySchema = z.object({
  code: z.string(),
  name: localizedTextSchema.nullable().optional(),
  symbol: z.string().nullable().optional(),
  is_default: z.boolean().optional().default(false),
});

export const currencyListSchema = z.array(currencySchema);
