import { z } from "zod";

import { BRAND_MAX_DESCRIPTION, BRAND_MAX_NAME } from "@/config/admin-brand.constant";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/dictionary.type";

type BrandEditValidation = Dictionary["adminBrands"]["edit"]["validation"];

/** Mirrors `UpdateBrandRequest` for the fields the dashboard edits. */
export function createBrandEditSchema(messages: BrandEditValidation) {
  return z.object({
    name_en: nameField(BRAND_MAX_NAME, messages.name),
    name_ar: nameField(BRAND_MAX_NAME, messages.name),
    description_en: z.string().trim().max(BRAND_MAX_DESCRIPTION, messages.description),
    description_ar: z.string().trim().max(BRAND_MAX_DESCRIPTION, messages.description),
  });
}

export type BrandEditFormValues = z.input<ReturnType<typeof createBrandEditSchema>>;
