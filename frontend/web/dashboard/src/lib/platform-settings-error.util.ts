import { SETTINGS_ROOT_ERROR_PREFIX } from "@/config/platform-settings.constant";
import type { MappedFormError } from "@/interfaces/core/mapped-form-error.interface";
import { mapApiFormError } from "@/lib/map-api-form-error.util";

/** The backend names fields `settings.<key>`; the form's fields are the bare keys. */
function toFormFieldName(name: string): string {
  return name.startsWith(SETTINGS_ROOT_ERROR_PREFIX) ? name.slice(SETTINGS_ROOT_ERROR_PREFIX.length) : name;
}

export function mapSettingsSaveError(error: unknown, generic: string): MappedFormError {
  return mapApiFormError(error, generic, toFormFieldName);
}
