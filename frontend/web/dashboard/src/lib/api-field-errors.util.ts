import { HttpStatus } from "@/enums/http-status.enum";
import type { MappedFormError } from "@/interfaces/mapped-form-error.interface";
import { ApiClientError } from "@/services/api/core/api-client-error";

/** Maps a failed write to inline field errors when the backend names the fields, else a form-level message. */
export function mapApiFieldErrors(error: unknown, generic: string): MappedFormError {
  if (error instanceof ApiClientError && error.status === HttpStatus.Unprocessable && error.fields) {
    const fieldErrors: Record<string, string> = {};
    for (const [name, list] of Object.entries(error.fields)) {
      const first = list[0];
      if (first) fieldErrors[name.replace(/\.\d+$/, "").replace(/^name\./, "name_")] = first;
    }
    if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  }
  return { fieldErrors: {}, formError: generic };
}
