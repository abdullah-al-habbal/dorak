import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { hasApiFieldErrors } from "@/lib/core/api-field-errors.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

/** The reset field the backend names when a link is unknown, used, expired or no longer eligible. */
export const RESET_TOKEN_FIELD = "token";

export function isInvalidResetLink(error: unknown): boolean {
  return hasApiFieldErrors(error) && RESET_TOKEN_FIELD in error.fields;
}

export function isTooManyRequests(error: unknown): boolean {
  return error instanceof ApiClientError && error.code === ApiErrorCode.TooManyRequests;
}
