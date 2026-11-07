import type { MappedFormError } from "@/interfaces/mapped-form-error.interface";
import { mapApiFormError } from "@/lib/map-api-form-error.util";

const API_TO_FORM_FIELD: Record<string, string> = { price_amount_minor: "price" };

/** `description.en` becomes the form field `description_en`; the minor-unit price field maps to the price input. */
function toFormFieldName(name: string): string {
  return API_TO_FORM_FIELD[name] ?? name.replace(/\./g, "_");
}

export function mapPlanSaveError(error: unknown, generic: string): MappedFormError {
  return mapApiFormError(error, generic, toFormFieldName);
}
