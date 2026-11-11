import { z } from "zod";

import { UniverseVisibility } from "@/enums/universe-visibility.enum";
import { localizedTextSchema } from "@/schemas/localized-text.zod";

/** A translatable map as the admin API returns it (`getTranslations`): an object, or an empty list when unset. */
const translationsSchema = z.union([z.record(z.string(), z.string().nullable()), z.array(z.never())]);
const bodySchema = z.union([z.record(z.string(), z.unknown()), z.array(z.never())]);

export const contentSectionSchema = z.object({
  id: z.string(),
  page_id: z.string(),
  section_type: z.string(),
  title: translationsSchema.optional(),
  subtitle: translationsSchema.optional(),
  body: bodySchema,
  media_url: z.string().nullable().optional(),
  sort_order: z.number().int(),
  universe_visibility: z.enum(UniverseVisibility),
});

export const contentPageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: localizedTextSchema,
  meta_description: translationsSchema.optional(),
  sections: z.array(contentSectionSchema).optional().default([]),
});

export const testimonialSchema = z.object({
  id: z.string(),
  section_id: z.string().nullable(),
  author_name: z.string(),
  author_title: translationsSchema.optional(),
  body: translationsSchema,
  avatar_url: z.string().nullable().optional(),
  rating: z.number().int(),
  sort_order: z.number().int(),
});

export const websiteContentSchema = z.object({
  pages: z.array(contentPageSchema),
  testimonials: z.array(testimonialSchema),
});

export const onboardingConfigSchema = z.object({
  id: z.string(),
  locale: z.string(),
  season: z.string().nullable(),
  hero_image_url: z.string(),
  is_active: z.boolean(),
  sort_order: z.number().int(),
});

export const onboardingConfigListSchema = z.array(onboardingConfigSchema);
