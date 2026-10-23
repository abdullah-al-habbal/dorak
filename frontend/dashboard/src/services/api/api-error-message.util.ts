import type { Dictionary } from "@/i18n/dictionary.types";
import { API_ERROR_STATUS_COPY } from "@/services/api/api-error-message.constant";
import type { ApiErrorCopyKey } from "@/services/api/api-error-message.types";
import { ApiClientError } from "@/services/api/client-error";

function apiErrorCopyKey(error: unknown): ApiErrorCopyKey {
  if (!(error instanceof ApiClientError)) return "unexpected";
  if (error.kind === "offline") return "offline";
  if (error.code === "feature_not_enabled") return "featureNotEnabled";
  return (
    API_ERROR_STATUS_COPY[error.status] ??
    (error.status >= 500 ? "server" : "unexpected")
  );
}

/** Translated, user-safe copy for any thrown API failure. */
export function apiErrorMessage(
  error: unknown,
  dictionary: Dictionary,
): string {
  return dictionary.common.apiError[apiErrorCopyKey(error)];
}
