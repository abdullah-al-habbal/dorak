import { z } from "zod";

import { CATALOG_ITEM_MAX_DURATION, CATALOG_ITEM_NAME_MAX } from "@/config/platform/admin-catalog.constant";
import type { CatalogItemAttributes } from "@/interfaces/services/catalog-item-attributes.interface";
import { attributesIssue } from "@/lib/catalog/catalog-item-attributes.util";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

/** A blank duration is allowed; otherwise a whole number of minutes from 1 to the maximum. */
export function isValidItemDuration(text: string): boolean {
  if (text.trim() === "") return true;
  const minutes = Number(text);
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= CATALOG_ITEM_MAX_DURATION;
}

/** The category falls back to the first loaded one, so it is checked against the loaded list when submitting. */
export function createCatalogItemFormSchema(messages: Dictionary["adminCatalog"]["items"]) {
  return z
    .object({
      name_en: nameField(CATALOG_ITEM_NAME_MAX, messages.form.required),
      name_ar: nameField(CATALOG_ITEM_NAME_MAX, messages.form.required),
      slug: z.string().trim().min(1, messages.form.required),
      category_id: z.string(),
      description_en: z.string(),
      description_ar: z.string(),
      duration: z.string().refine(isValidItemDuration, messages.form.invalidDuration),
      is_active: z.boolean(),
      tag_ids: z.array(z.string()),
      attributes: z.custom<CatalogItemAttributes>(),
    })
    .superRefine((values, context) => {
      const issue = attributesIssue(values.attributes);
      if (issue !== undefined) context.addIssue({ code: "custom", message: messages.attributes.issues[issue], path: ["attributes"] });
    });
}
