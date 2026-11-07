import { mapApiFieldErrors } from "@/lib/api-field-errors.util";
import type { MappedFormError } from "@/lib/booking-form-error.util";

const API_TO_FORM_FIELD: Record<string, string> = { price_amount_minor: "price" };

/** `description.en` becomes the form field `description_en`; the minor-unit price field maps to the price input. */
function toFormFieldName(name: string): string {
  return API_TO_FORM_FIELD[name] ?? name.replace(/\./g, "_");
}

export function mapPlanSaveError(error: unknown, generic: string): MappedFormError {
  const mapped = mapApiFieldErrors(error, generic);
  const fieldErrors: Record<string, string> = {};
  for (const [name, message] of Object.entries(mapped.fieldErrors)) fieldErrors[toFormFieldName(name)] = message;
  return { ...mapped, fieldErrors };
}
