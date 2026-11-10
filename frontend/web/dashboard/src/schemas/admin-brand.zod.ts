import { z } from "zod";

import { BrandStatus } from "@/enums/brand-status.enum";
import { localizedTextSchema } from "@/schemas/localized-text.zod";
import { optionalTranslationSchema } from "@/schemas/optional-translation.zod";

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
  status_reason: z.string().nullable().optional(),
  submission_count: z.number().optional(),
  max_submissions: z.number().optional(),
  features: z.record(z.string(), z.boolean()).optional(),
  branches_count: z.number().nullable().optional(),
  created_at: z.string(),
});

export const adminBrandListSchema = z.array(adminBrandSchema);
