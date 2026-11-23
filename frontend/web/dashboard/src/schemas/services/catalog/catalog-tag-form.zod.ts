import { z } from "zod";

import { CATALOG_TAG_GROUP_MAX, CATALOG_TAG_NAME_MAX } from "@/config/platform/admin-catalog.constant";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export function createCatalogTagFormSchema(messages: Dictionary["adminCatalog"]["tags"]["form"]) {
  return z
    .object({
      name_en: nameField(CATALOG_TAG_NAME_MAX, messages.required),
      name_ar: nameField(CATALOG_TAG_NAME_MAX, messages.required),
      /** Optional pair: both blank means ungrouped, otherwise both are needed. */
      group_name_en: z.string().max(CATALOG_TAG_GROUP_MAX),
      group_name_ar: z.string().max(CATALOG_TAG_GROUP_MAX),
      is_active: z.boolean(),
    })
    .superRefine((values, context) => {
      const filled = [values.group_name_en, values.group_name_ar].filter((value) => value.trim() !== "").length;
      if (filled !== 1) return;
      const missing = values.group_name_en.trim() === "" ? "group_name_en" : "group_name_ar";
      context.addIssue({ code: "custom", path: [missing], message: messages.groupBoth });
    });
}
