import type { MappedFormError } from "@/interfaces/mapped-form-error.interface";
import { mapApiFieldErrors } from "@/lib/api-field-errors.util";
import type { FormFieldNameMapper } from "@/types/form-field-name-mapper.type";

/**
 * Maps a failed write with `mapApiFieldErrors`, then renames each field key with the form's own
 * mapper. Without a mapper the base mapping is returned as it is; the form-level message is kept.
 */
export function mapApiFormError(error: unknown, generic: string, toFormFieldName?: FormFieldNameMapper): MappedFormError {
  const mapped = mapApiFieldErrors(error, generic);
  if (!toFormFieldName) return mapped;
  const fieldErrors: Record<string, string> = {};
  for (const [name, message] of Object.entries(mapped.fieldErrors)) fieldErrors[toFormFieldName(name)] = message;
  return { ...mapped, fieldErrors };
}
