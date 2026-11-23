import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import { toLocalePair } from "@/lib/core/format/locale-pair.util";
import type { CatalogTagPayload } from "@/services/api/mutation/services/catalog-admin.mutation";
import type { CatalogTagFormValues } from "@/types/services/catalog/catalog-tag-form-values.type";
import type { CatalogTag } from "@/types/services/catalog-item.type";

/** A new tag starts active. */
export function tagToForm(tag: CatalogTag | undefined): CatalogTagFormValues {
  const name = toLocalePair(tag?.name);
  const group = toLocalePair(tag?.group_name_translations);
  return { name_en: name.en, name_ar: name.ar, group_name_en: group.en, group_name_ar: group.ar, is_active: tag?.is_active ?? true };
}

/** A blank group pair is sent as `null`. */
export function formToTagPayload(values: CatalogTagFormValues): CatalogTagPayload {
  const group = { en: values.group_name_en.trim(), ar: values.group_name_ar.trim() };
  const ungrouped = group.en === "" && group.ar === "";
  return { name: { en: values.name_en.trim(), ar: values.name_ar.trim() }, group_name: ungrouped ? null : group, is_active: values.is_active };
}

export const mapTagFieldName = createFieldNameMapper({ name_en: "name_en", name_ar: "name_ar", "group_name.en": "group_name_en", "group_name.ar": "group_name_ar", is_active: "is_active" });
