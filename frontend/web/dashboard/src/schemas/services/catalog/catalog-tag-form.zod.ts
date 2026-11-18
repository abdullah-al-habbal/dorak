import { z } from "zod";

import { CATALOG_TAG_GROUP_MAX, CATALOG_TAG_NAME_MAX } from "@/config/platform/admin-catalog.constant";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export function createCatalogTagFormSchema(messages: Dictionary["adminCatalog"]["tags"]["form"]) {
  return z.object({
    name_en: nameField(CATALOG_TAG_NAME_MAX, messages.required),
    name_ar: nameField(CATALOG_TAG_NAME_MAX, messages.required),
    /** Optional: blank means ungrouped. */
    group_name: z.string().max(CATALOG_TAG_GROUP_MAX),
    is_active: z.boolean(),
  });
}
