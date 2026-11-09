import { z } from "zod";

import { VenueUniverse } from "@/enums/venue-universe.enum";
import { localizedTextSchema } from "@/schemas/localized-text.zod";
import { optionalTranslationSchema } from "@/schemas/optional-translation.zod";

/** `AdminCatalogCategoryResource`: one category with its usage counts. */
const categoryFields = {
  id: z.string(),
  name: localizedTextSchema,
  description: optionalTranslationSchema.optional(),
  slug: z.string(),
  parent_id: z.string().nullable(),
  universe: z.enum(VenueUniverse),
  is_active: z.boolean(),
  sort_order: z.number().int(),
  items_count: z.number().int(),
  children_count: z.number().int(),
  services_count: z.number().int(),
  created_at: z.string().nullable(),
};

export const catalogSubcategorySchema = z.object(categoryFields);

/** Top-level rows carry their subcategories (read-only on the dashboard). */
export const adminCatalogCategorySchema = z.object({ ...categoryFields, children: z.array(catalogSubcategorySchema).optional().default([]) });

export const adminCatalogCategoryListSchema = z.array(adminCatalogCategorySchema);
