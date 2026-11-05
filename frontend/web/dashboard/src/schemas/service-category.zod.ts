import { z } from "zod";

import { localizedTextSchema } from "@/schemas/localized-text.zod";

export const serviceCategorySchema = z.object({
  id: z.string(),
  name: localizedTextSchema.nullable().optional(),
});

export const serviceCategoryListSchema = z.array(serviceCategorySchema);
