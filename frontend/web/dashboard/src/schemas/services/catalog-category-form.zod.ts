import { z } from "zod";

import { CATALOG_CATEGORY_MAX_DESCRIPTION, CATALOG_CATEGORY_MAX_NAME, CATALOG_CATEGORY_MAX_SORT_ORDER } from "@/config/admin-catalog.constant";
import { VenueUniverse } from "@/enums/venue-universe.enum";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/dictionary.type";

type CatalogValidation = Dictionary["adminCatalog"]["form"]["validation"];

function isSortOrder(text: string): boolean {
  const value = Number(text.trim());
  return text.trim() === "" || (Number.isInteger(value) && value >= 0 && value <= CATALOG_CATEGORY_MAX_SORT_ORDER);
}

/** Mirrors `SaveCatalogCategoryRequest`; messages come from the dictionary so they read in the active locale. */
export function createCatalogCategorySchema(messages: CatalogValidation) {
  return z.object({
    name_en: nameField(CATALOG_CATEGORY_MAX_NAME, messages.name),
    name_ar: nameField(CATALOG_CATEGORY_MAX_NAME, messages.name),
    description_en: z.string().trim().max(CATALOG_CATEGORY_MAX_DESCRIPTION, messages.description),
    description_ar: z.string().trim().max(CATALOG_CATEGORY_MAX_DESCRIPTION, messages.description),
    universe: z.enum(VenueUniverse, messages.universe),
    sort_order: z.string().refine(isSortOrder, messages.sortOrder),
    is_active: z.boolean(),
  });
}

export type CatalogCategoryFormValues = z.input<ReturnType<typeof createCatalogCategorySchema>>;
