import { z } from "zod";

import { localizedTextSchema } from "@/schemas/core/localized-text.zod";

/** The fields of `ServiceCatalogItemResource` the read-only items overview shows. */
export const catalogItemPreviewSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  default_duration_minutes: z.number().int().nullable().optional(),
  is_active: z.boolean(),
});

export const catalogItemPreviewListSchema = z.array(catalogItemPreviewSchema);
