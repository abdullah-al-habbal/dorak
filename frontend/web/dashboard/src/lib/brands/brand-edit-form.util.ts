import type { BrandUpdatePayload } from "@/interfaces/brands/brand-update-payload.interface";
import type { MappedFormError } from "@/interfaces/core/query/mapped-form-error.interface";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import type { BrandEditFormValues } from "@/schemas/brands/brand-edit-form.zod";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

type Translatable = AdminBrand["name"] | AdminBrand["description"];

function translation(value: Translatable, locale: "en" | "ar"): string {
  if (!value) return "";
  return typeof value === "string" ? value : (value[locale] ?? "");
}

export function brandToEditForm(brand: AdminBrand): BrandEditFormValues {
  return {
    name_en: translation(brand.name, "en"),
    name_ar: translation(brand.name, "ar"),
    description_en: translation(brand.description, "en"),
    description_ar: translation(brand.description, "ar"),
  };
}

export function editFormToBrandPayload(values: BrandEditFormValues): BrandUpdatePayload {
  return {
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    description: { en: values.description_en.trim() || null, ar: values.description_ar.trim() || null },
  };
}

/** `name.en` becomes the form field `name_en`. */
export function mapBrandEditError(error: unknown, generic: string): MappedFormError {
  return mapApiFormError(error, generic, (name) => name.replace(/\./g, "_"));
}
