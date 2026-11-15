import { VenueUniverse } from "@/enums/venue-universe.enum";
import type { CatalogCategoryPayload } from "@/interfaces/services/catalog-category-payload.interface";
import type { CatalogCategoryFormValues } from "@/schemas/services/catalog-category-form.zod";
import type { AdminCatalogCategory } from "@/types/services/admin-catalog-category.type";

type Translatable = AdminCatalogCategory["name"] | AdminCatalogCategory["description"];

function translation(value: Translatable, locale: "en" | "ar"): string {
  if (!value) return "";
  return typeof value === "string" ? value : (value[locale] ?? "");
}

function orNull(text: string): string | null {
  return text.trim() === "" ? null : text.trim();
}

export function emptyCatalogCategoryForm(): CatalogCategoryFormValues {
  return { name_en: "", name_ar: "", description_en: "", description_ar: "", universe: VenueUniverse.Unisex, sort_order: "0", is_active: true };
}

export function catalogCategoryToForm(category: AdminCatalogCategory): CatalogCategoryFormValues {
  return {
    name_en: translation(category.name, "en"),
    name_ar: translation(category.name, "ar"),
    description_en: translation(category.description, "en"),
    description_ar: translation(category.description, "ar"),
    universe: category.universe,
    sort_order: String(category.sort_order),
    is_active: category.is_active,
  };
}

/** Values are validated first; a blank sort order is sent as 0 and a blank description as null. */
export function formToCatalogCategoryPayload(values: CatalogCategoryFormValues): CatalogCategoryPayload {
  return {
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    description: { en: orNull(values.description_en), ar: orNull(values.description_ar) },
    universe: values.universe,
    sort_order: values.sort_order.trim() === "" ? 0 : Number(values.sort_order),
    is_active: values.is_active,
  };
}

/** Mirrors the backend emptiness guard: subcategories, catalog items or services keep a category from being deleted. */
export function isCatalogCategoryInUse(category: AdminCatalogCategory): boolean {
  return category.children_count > 0 || category.items_count > 0 || category.services_count > 0;
}
