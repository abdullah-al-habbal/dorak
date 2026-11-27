import { z } from "zod";

import { localizedTextSchema } from "@/schemas/core/api/localized-text.zod";

/** Laravel encodes an empty translation set as `[]`, not `{}`; both mean "no text". */
const translationsSchema = z.union([
  z.record(z.string(), z.string().nullable()),
  z.array(z.never()).transform((): Record<string, string | null> => ({})),
]);

const ratingFields = { rating_average: z.number().nullable(), rating_count: z.number() };

export const publicServiceSchema = z.object({
  name: localizedTextSchema,
  description: localizedTextSchema.nullable().optional(),
  price_amount_minor: z.number(),
  currency_code: z.string().nullable().optional(),
  duration_minutes: z.number().nullable().optional(),
  is_at_home: z.boolean().optional().default(false),
});

const shiftSchema = z.object({ opens_time: z.string(), closes_time: z.string() });

export const publicHoursDaySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  is_closed: z.boolean(),
  shifts: z.array(shiftSchema).default([]),
});

export const publicBranchSummarySchema = z.object({
  slug: z.string(),
  name: translationsSchema,
  address: translationsSchema,
  ...ratingFields,
});

export const publicBrandSummarySchema = z.object({ slug: z.string(), name: translationsSchema });

export const publicStylistSummarySchema = z.object({
  slug: z.string(),
  name: translationsSchema,
  is_freelancer: z.boolean(),
  ...ratingFields,
});

export const publicBrandProfileSchema = z.object({
  slug: z.string(),
  name: translationsSchema,
  description: translationsSchema,
  logo_url: z.string().nullable(),
  branches: z.array(publicBranchSummarySchema),
});

export const publicBranchProfileSchema = z.object({
  slug: z.string(),
  name: translationsSchema,
  description: translationsSchema,
  address: translationsSchema,
  tags: z.array(z.object({ en: z.string(), ar: z.string() })),
  timezone: z.string().optional(),
  latitude: z.coerce.number().nullable(),
  longitude: z.coerce.number().nullable(),
  brand: publicBrandSummarySchema.nullable(),
  stylists: z.array(publicStylistSummarySchema),
  services: z.array(publicServiceSchema),
  opening_hours: z.array(publicHoursDaySchema),
  ...ratingFields,
});

const workplaceSchema = z.object({ type: z.enum(["branch", "brand"]), slug: z.string(), name: translationsSchema });

export const publicStylistProfileSchema = z.object({
  slug: z.string(),
  name: translationsSchema,
  bio: translationsSchema,
  is_freelancer: z.boolean(),
  portfolio: z.array(z.object({ url: z.string() })),
  services: z.array(publicServiceSchema),
  workplaces: z.array(workplaceSchema),
  ...ratingFields,
});

const sitemapEntrySchema = z.object({ slug: z.string(), updated_at: z.string().nullable() });

export const publicSitemapSchema = z.object({
  brands: z.array(sitemapEntrySchema),
  branches: z.array(sitemapEntrySchema),
  stylists: z.array(sitemapEntrySchema),
});
