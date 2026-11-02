import { z } from "zod";
import {
  FACE_SHAPES,
  HAIR_TEXTURES,
  MAX_DURATION_MINUTES,
} from "@/services/api/dashboard/catalog/catalog.constant";

const localized = z.object({ en: z.string(), ar: z.string() });

export const CatalogItemSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  name: localized,
  description: localized,
  slug: z.string(),
  isActive: z.boolean(),
  durationMinutes: z.number().nullable(),
  faceShapes: z.array(z.enum(FACE_SHAPES)),
  hairTextures: z.array(z.enum(HAIR_TEXTURES)),
  tagIds: z.array(z.string()),
});

export const CatalogCategorySchema = z.object({
  id: z.string(),
  name: localized,
});

export const CatalogTagSchema = z.object({
  id: z.string(),
  name: localized,
  groupName: z.string().nullable(),
});

/** A lone checkbox registers as boolean/string rather than an array. */
const checkedValues = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((value) => {
    if (Array.isArray(value)) return value;
    return typeof value === "string" && value !== "" ? [value] : [];
  }, z.array(item));

export const catalogItemFormSchema = z.object({
  categoryId: z.string().min(1),
  nameEn: z.string().min(1).max(255),
  nameAr: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  descriptionEn: z.string().max(5000),
  descriptionAr: z.string().max(5000),
  isActive: z.boolean(),
  durationMinutes: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.coerce.number().int().min(1).max(MAX_DURATION_MINUTES).nullable(),
  ),
  faceShapes: checkedValues(z.enum(FACE_SHAPES)),
  hairTextures: checkedValues(z.enum(HAIR_TEXTURES)),
  tagIds: checkedValues(z.string()),
});
