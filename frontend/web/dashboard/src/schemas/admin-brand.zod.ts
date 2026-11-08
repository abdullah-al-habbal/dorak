import { z } from "zod";

import { BrandStatus } from "@/enums/brand-status.enum";
import { localizedTextSchema } from "@/schemas/localized-text.zod";

/** Spatie serialises a translatable field with no translations as `[]`; read that as "no text". */
const optionalTranslationSchema = z.preprocess((value) => (Array.isArray(value) && value.length === 0 ? null : value), localizedTextSchema.nullable());

/** `GET /brands` and `GET /brands/{id}` (`BrandResource`), the fields the admin approval screen reads. */
export const adminBrandSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  description: optionalTranslationSchema.optional(),
  logo_url: z.string().nullable().optional(),
  owner: z.object({ id: z.string(), email: z.string().nullable() }).nullable().optional(),
  base_currency: z.object({ id: z.string(), code: z.string() }).nullable().optional(),
  slug: z.string().nullable().optional(),
  universe: z.string().nullable().optional(),
  status: z.enum(BrandStatus),
  branches_count: z.number().nullable().optional(),
  created_at: z.string(),
});

export const adminBrandListSchema = z.array(adminBrandSchema);
