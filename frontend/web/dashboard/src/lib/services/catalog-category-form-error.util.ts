import type { MappedFormError } from "@/interfaces/core/query/mapped-form-error.interface";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";

/** `name.en` becomes the form field `name_en`. */
function toFormFieldName(name: string): string {
  return name.replace(/\./g, "_");
}

export function mapCatalogCategorySaveError(error: unknown, generic: string): MappedFormError {
  return mapApiFormError(error, generic, toFormFieldName);
}
