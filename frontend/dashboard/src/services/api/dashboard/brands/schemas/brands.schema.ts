import { z } from "zod";
import { BRAND_UNIVERSES } from "@/services/api/dashboard/brands/brands.constant";

const localized = z.object({ en: z.string(), ar: z.string() });

export const BrandSchema = z.object({
  id: z.string(),
  name: localized,
  description: localized,
  logoUrl: z.string().nullable(),
  slug: z.string().nullable(),
  universe: z.enum(BRAND_UNIVERSES),
  baseCurrencyCode: z.string().nullable(),
  branchesCount: z.number(),
});

export const brandFormSchema = z.object({
  nameEn: z.string().min(1).max(255),
  nameAr: z.string().min(1).max(255),
  descriptionEn: z.string().max(5000),
  descriptionAr: z.string().max(5000),
  logoUrl: z.union([z.literal(""), z.string().url().max(2048)]),
  baseCurrencyCode: z.string().min(1),
  universe: z.enum(BRAND_UNIVERSES),
});
