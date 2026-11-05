import { ApiClientError } from "@/services/api/core/api-client-error";
import type { MappedFormError } from "@/lib/booking-form-error.util";

const HTTP_UNPROCESSABLE = 422;

/** Maps a failed write to inline field errors when the backend names the fields, else a form-level message. */
export function mapApiFieldErrors(error: unknown, generic: string): MappedFormError {
  if (error instanceof ApiClientError && error.status === HTTP_UNPROCESSABLE && error.fields) {
    const fieldErrors: Record<string, string> = {};
    for (const [name, list] of Object.entries(error.fields)) {
      const first = list[0];
      if (first) fieldErrors[name.replace(/\.\d+$/, "").replace(/^name\./, "name_")] = first;
    }
    if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  }
  return { fieldErrors: {}, formError: generic };
}
