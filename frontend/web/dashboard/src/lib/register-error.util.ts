import { ApiErrorCode } from "@/enums/api-error-code.enum";
import type { Dictionary } from "@/types/dictionary.type";
import { ApiClientError } from "@/services/api/core/api-client-error";

/** Copy for a failed sign-up step; anything not listed is `generic`, the shared "something went wrong" message. */
export function registerErrorMessage(error: unknown, t: Dictionary["registerBusiness"], generic: string): string {
  if (error instanceof ApiClientError) {
    if (error.code === ApiErrorCode.TooManyRequests) return t.tooMany;
    if (error.code === ApiErrorCode.AccountBanned) return t.banned;
  }
  return generic;
}
