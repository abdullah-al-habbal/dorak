import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import { toLocalePair } from "@/lib/core/format/locale-pair.util";
import type { CatalogTagPayload } from "@/services/api/mutation/services/catalog-admin.mutation";
import type { CatalogTagFormValues } from "@/types/services/catalog/catalog-tag-form-values.type";
import type { CatalogTag } from "@/types/services/catalog-item.type";

/** A new tag starts active. */
export function tagToForm(tag: CatalogTag | undefined): CatalogTagFormValues {
  const name = toLocalePair(tag?.name);
  return { name_en: name.en, name_ar: name.ar, group_name: tag?.group_name ?? "", is_active: tag?.is_active ?? true };
}

/** A blank group is sent as `null`. */
export function formToTagPayload(values: CatalogTagFormValues): CatalogTagPayload {
  const group = values.group_name.trim();
  return { name: { en: values.name_en.trim(), ar: values.name_ar.trim() }, group_name: group === "" ? null : group, is_active: values.is_active };
}

export const mapTagFieldName = createFieldNameMapper({ name_en: "name_en", name_ar: "name_ar", group_name: "group_name", is_active: "is_active" });
