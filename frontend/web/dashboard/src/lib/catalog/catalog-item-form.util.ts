import { attributesFromItem, attributesToPayload } from "@/lib/catalog/catalog-item-attributes.util";
import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import { toLocalePair } from "@/lib/core/format/locale-pair.util";
import type { CatalogItemPayload } from "@/services/api/mutation/services/catalog-admin.mutation";
import type { CatalogItemFormValues } from "@/types/services/catalog/catalog-item-form-values.type";
import type { CatalogItem } from "@/types/services/catalog-item.type";

export function itemToForm(item: CatalogItem | undefined): CatalogItemFormValues {
  const name = toLocalePair(item?.name);
  const description = toLocalePair(item?.description);
  return {
    name_en: name.en,
    name_ar: name.ar,
    slug: item?.slug ?? "",
    category_id: item?.category_id ?? "",
    description_en: description.en,
    description_ar: description.ar,
    duration: item?.default_duration_minutes ? String(item.default_duration_minutes) : "",
    is_active: item?.is_active ?? true,
    tag_ids: item?.tags.map((tag) => tag.id) ?? [],
    attributes: attributesFromItem(item),
  };
}

/** An untouched category is the first loaded one. */
export function resolveItemCategory(categoryId: string, loadedIds: readonly string[]): string {
  return categoryId || loadedIds[0] || "";
}

/** Blank descriptions and duration are sent as `null`. */
export function formToItemPayload(values: CatalogItemFormValues, categoryId: string): CatalogItemPayload {
  const minutes = values.duration.trim();
  return {
    category_id: categoryId,
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    description: { en: values.description_en.trim() || null, ar: values.description_ar.trim() || null },
    slug: values.slug.trim(),
    default_duration_minutes: minutes === "" ? null : Number(minutes),
    is_active: values.is_active,
    tag_ids: values.tag_ids,
    ...attributesToPayload(values.attributes),
  };
}

export const mapItemFieldName = createFieldNameMapper({
  category_id: "category_id",
  name_en: "name_en",
  name_ar: "name_ar",
  "description.en": "description_en",
  "description.ar": "description_ar",
  slug: "slug",
  default_duration_minutes: "duration",
  is_active: "is_active",
  tag_ids: "tag_ids",
  price_range: "attributes",
  maintenance_level: "attributes",
  style_period_type: "attributes",
  formality_level: "attributes",
  face_shapes: "attributes",
  hair_textures: "attributes",
});
