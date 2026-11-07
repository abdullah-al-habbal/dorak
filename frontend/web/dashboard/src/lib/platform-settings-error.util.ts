import { SETTINGS_ROOT_ERROR_PREFIX } from "@/config/platform-settings.constant";
import { mapApiFieldErrors } from "@/lib/api-field-errors.util";
import type { MappedFormError } from "@/lib/booking-form-error.util";

/** The backend names fields `settings.<key>`; the form's fields are the bare keys. */
export function mapSettingsSaveError(error: unknown, generic: string): MappedFormError {
  const mapped = mapApiFieldErrors(error, generic);
  const fieldErrors: Record<string, string> = {};
  for (const [name, message] of Object.entries(mapped.fieldErrors)) {
    fieldErrors[name.startsWith(SETTINGS_ROOT_ERROR_PREFIX) ? name.slice(SETTINGS_ROOT_ERROR_PREFIX.length) : name] = message;
  }
  return { ...mapped, fieldErrors };
}
