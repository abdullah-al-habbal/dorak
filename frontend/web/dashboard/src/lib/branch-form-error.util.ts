import { HttpStatus } from "@/enums/http-status.enum";
import type { MappedFormError } from "@/lib/booking-form-error.util";
import { mapApiFieldErrors } from "@/lib/api-field-errors.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

interface BranchSaveMessages {
  generic: string;
  /** The brand's plan does not allow another branch, or the branch is locked after a downgrade. */
  planLimit: string;
}

/** `description.en` becomes the form field `description_en`. */
function toFormFieldName(name: string): string {
  return name.replace(/\./g, "_");
}

/** Maps a failed branch save to field errors, the plan-limit notice, the backend's own conflict message, or a generic message. */
export function mapBranchSaveError(error: unknown, messages: BranchSaveMessages): MappedFormError {
  if (error instanceof ApiClientError && error.status === HttpStatus.Forbidden) return { fieldErrors: {}, formError: messages.planLimit };
  if (error instanceof ApiClientError && error.status === HttpStatus.Conflict) return { fieldErrors: {}, formError: error.message || messages.generic };
  const mapped = mapApiFieldErrors(error, messages.generic);
  const fieldErrors: Record<string, string> = {};
  for (const [name, message] of Object.entries(mapped.fieldErrors)) fieldErrors[toFormFieldName(name)] = message;
  return { ...mapped, fieldErrors };
}
