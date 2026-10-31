import {
  CatalogCategorySchema,
  CatalogItemSchema,
  CatalogTagSchema,
} from "@/services/api/dashboard/catalog/schemas/catalog.schema";
import type { ICatalogCategory } from "@/services/api/dashboard/catalog/types/icatalog-category.types";
import type { ICatalogItem } from "@/services/api/dashboard/catalog/types/icatalog-item.types";
import type { ICatalogTag } from "@/services/api/dashboard/catalog/types/icatalog-tag.types";
import { isRecord } from "@/utils/guards.util";
import type { ICatalogItemForm } from "@/services/api/dashboard/catalog/types/icatalog-item-form.types";

type Wire = Record<string, unknown>;

function record(value: unknown): Wire {
  return isRecord(value) ? value : {};
}
function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function textList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}
function localized(value: unknown) {
  const item = record(value);
  return { en: text(item.en), ar: text(item.ar) };
}

export function mapCatalogItem(wire: unknown): ICatalogItem {
  const item = record(wire);
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const duration = item.default_duration_minutes;
  return CatalogItemSchema.parse({
    id: text(item.id),
    categoryId: text(item.category_id),
    name: localized(item.name),
    description: localized(item.description),
    slug: text(item.slug),
    isActive: item.is_active === true,
    durationMinutes: typeof duration === "number" ? duration : null,
    // Unknown enum values from a newer backend are dropped rather than fatal.
    faceShapes: textList(item.face_shapes).filter(isFaceShape),
    hairTextures: textList(item.hair_textures).filter(isHairTexture),
    tagIds: tags.map((tag) => text(record(tag).id)).filter(Boolean),
  });
}

const CATALOG_FACE_SHAPE_SET: ReadonlySet<string> = new Set(
  CatalogItemSchema.shape.faceShapes.element.options,
);
const CATALOG_HAIR_TEXTURE_SET: ReadonlySet<string> = new Set(
  CatalogItemSchema.shape.hairTextures.element.options,
);
function isFaceShape(value: string) {
  return CATALOG_FACE_SHAPE_SET.has(value);
}
function isHairTexture(value: string) {
  return CATALOG_HAIR_TEXTURE_SET.has(value);
}

export function mapCatalogCategory(wire: unknown): ICatalogCategory {
  const item = record(wire);
  return CatalogCategorySchema.parse({
    id: text(item.id),
    name: localized(item.name),
  });
}

export function mapCatalogTag(wire: unknown): ICatalogTag {
  const item = record(wire);
  return CatalogTagSchema.parse({
    id: text(item.id),
    name: localized(item.name),
    group: text(item.group) || null,
  });
}

export function catalogItemPayload(form: ICatalogItemForm) {
  return {
    category_id: form.categoryId,
    name: { en: form.nameEn, ar: form.nameAr },
    description: {
      en: form.descriptionEn === "" ? null : form.descriptionEn,
      ar: form.descriptionAr === "" ? null : form.descriptionAr,
    },
    slug: form.slug,
    is_active: form.isActive,
    default_duration_minutes: form.durationMinutes,
    face_shapes: form.faceShapes,
    hair_textures: form.hairTextures,
    tag_ids: form.tagIds,
  };
}
