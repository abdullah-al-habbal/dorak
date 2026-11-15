import { z } from "zod";

import { BRAND_MAX_NAME } from "@/config/admin-brand.constant";
import { OWNER_BRANCH_NAME_MAX } from "@/config/owner-brand.constant";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/dictionary.type";

type BrandCreateValidation = Dictionary["ownerBrand"]["create"]["validation"];

/** Mirrors `CreateBrandRequest` for the fields the owner sets when adding a brand. */
export function createBrandCreateSchema(messages: BrandCreateValidation) {
  return z.object({
    name_en: nameField(BRAND_MAX_NAME, messages.name),
    name_ar: nameField(BRAND_MAX_NAME, messages.name),
    currency: z.string().trim().min(1, messages.currency),
    branch_en: nameField(OWNER_BRANCH_NAME_MAX, messages.branch),
    branch_ar: nameField(OWNER_BRANCH_NAME_MAX, messages.branch),
  });
}

export type BrandCreateFormValues = z.input<ReturnType<typeof createBrandCreateSchema>>;
