import { HttpStatus } from "@/enums/access/http-status.enum";
import type { MappedFormError } from "@/interfaces/core/query/mapped-form-error.interface";
import { ApiClientError } from "@/services/api/core/api-client-error";

/**
 * True when the backend rejected named fields. The proxy forwards a backend 422 as a 400 that keeps
 * `fields` (`mapBackendFailure`), so both statuses count; any other status never carries them.
 */
export function hasApiFieldErrors(error: unknown): error is ApiClientError & { fields: Record<string, string[]> } {
  return error instanceof ApiClientError && (error.status === HttpStatus.Unprocessable || error.status === HttpStatus.BadRequest) && error.fields !== undefined;
}

/** Maps a failed write to inline field errors when the backend names the fields, else a form-level message. */
export function mapApiFieldErrors(error: unknown, generic: string): MappedFormError {
  if (hasApiFieldErrors(error)) {
    const fieldErrors: Record<string, string> = {};
    for (const [name, list] of Object.entries(error.fields)) {
      const first = list[0];
      if (first) fieldErrors[name.replace(/\.\d+$/, "").replace(/^name\./, "name_")] = first;
    }
    if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  }
  return { fieldErrors: {}, formError: generic };
}
