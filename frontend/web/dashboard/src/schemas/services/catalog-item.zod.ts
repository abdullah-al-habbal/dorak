import { z } from "zod";

import { FaceShape } from "@/enums/catalog/face-shape.enum";
import { FormalityLevel } from "@/enums/catalog/formality-level.enum";
import { HairTexture } from "@/enums/catalog/hair-texture.enum";
import { MaintenanceLevel } from "@/enums/catalog/maintenance-level.enum";
import { StylePeriod } from "@/enums/catalog/style-period.enum";
import { localizedTextSchema } from "@/schemas/core/api/localized-text.zod";
import { optionalTranslationSchema } from "@/schemas/core/api/optional-translation.zod";

const tagRefSchema = z.object({ id: z.string(), name: localizedTextSchema, slug: z.string().optional(), group_name: z.string().nullable().optional() });

/** `ServiceCatalogItemResource` as the admin item screen reads it (with its category and tags loaded). */
export const catalogItemSchema = z.object({
  id: z.string(),
  category_id: z.string(),
  name: localizedTextSchema,
  description: optionalTranslationSchema.optional(),
  slug: z.string(),
  default_duration_minutes: z.number().int().nullable().optional(),
  /** Minor units, like every price the backend stores. */
  price_range: z.object({ min: z.number(), max: z.number(), currency: z.string() }).nullable().optional(),
  maintenance_level: z.enum(MaintenanceLevel).nullable().optional(),
  style_period_type: z.enum(StylePeriod).nullable().optional(),
  formality_level: z.enum(FormalityLevel).nullable().optional(),
  face_shapes: z.array(z.enum(FaceShape)).nullable().optional(),
  hair_textures: z.array(z.enum(HairTexture)).nullable().optional(),
  category: z.object({ id: z.string(), name: localizedTextSchema }).optional(),
  tags: z.array(tagRefSchema).optional().default([]),
  is_active: z.boolean(),
});

export const catalogItemListSchema = z.array(catalogItemSchema);

/** `AdminCatalogTagResource`, also the shape the list route returns. */
export const catalogTagSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  slug: z.string().optional(),
  group_name: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
  items_count: z.number().int().optional().default(0),
});

export const catalogTagListSchema = z.array(catalogTagSchema);
