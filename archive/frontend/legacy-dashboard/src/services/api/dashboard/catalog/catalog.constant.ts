import type { ICatalogItemFormInput } from "@/services/api/dashboard/catalog/types/icatalog-item-form-input.types";

export const FACE_SHAPES = [
  "oval",
  "round",
  "square",
  "heart",
  "diamond",
  "oblong",
  "triangle",
] as const;
export const HAIR_TEXTURES = ["straight", "wavy", "curly", "coily"] as const;

export const MAX_DURATION_MINUTES = 1440;

export const CATALOG_QUERY_KEYS = {
  items: ["dashboard", "catalog-items"],
  lookups: ["lookups", "service-catalog-items"],
} as const;

export const CATALOG_SERVER_FIELD_MAP: Record<
  string,
  keyof ICatalogItemFormInput
> = {
  category_id: "categoryId",
  "name.en": "nameEn",
  "name.ar": "nameAr",
  slug: "slug",
  "description.en": "descriptionEn",
  "description.ar": "descriptionAr",
  default_duration_minutes: "durationMinutes",
};
