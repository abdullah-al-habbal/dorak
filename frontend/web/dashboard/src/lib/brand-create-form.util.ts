import type { BrandCreatePayload } from "@/interfaces/brand-create-payload.interface";
import type { MappedFormError } from "@/interfaces/mapped-form-error.interface";
import { mapApiFormError } from "@/lib/map-api-form-error.util";
import type { BrandCreateFormValues } from "@/schemas/brand-create-form.zod";

export const EMPTY_BRAND_CREATE_FORM: BrandCreateFormValues = { name_en: "", name_ar: "", currency: "", branch_en: "", branch_ar: "" };

export function createFormToBrandPayload(values: BrandCreateFormValues): BrandCreatePayload {
  return {
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    base_currency_code: values.currency.trim(),
    first_branch: { name: { en: values.branch_en.trim(), ar: values.branch_ar.trim() } },
  };
}

const FIELD_BY_API_NAME: Record<string, keyof BrandCreateFormValues> = {
  "name.en": "name_en",
  "name.ar": "name_ar",
  base_currency_code: "currency",
  "first_branch.name.en": "branch_en",
  "first_branch.name.ar": "branch_ar",
};

/** Backend field names become the form's; an unknown name stays as it is and shows in the banner. */
export function mapBrandCreateError(error: unknown, generic: string): MappedFormError {
  return mapApiFormError(error, generic, (name) => FIELD_BY_API_NAME[name] ?? name);
}
