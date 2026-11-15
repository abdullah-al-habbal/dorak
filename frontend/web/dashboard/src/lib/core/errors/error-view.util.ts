import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { ApiClientError } from "@/services/api/core/api-client-error";

export type ErrorViewKind = "generic" | "unavailable" | "rateLimited" | "forbidden";

const UNAVAILABLE_STATUSES: readonly number[] = [HttpStatus.BadGateway, HttpStatus.ServiceUnavailable];

/** Which copy an error boundary shows: maintenance, rate limit, access denied, or the generic failure. */
export function classifyError(error: unknown): ErrorViewKind {
  if (!(error instanceof ApiClientError)) return "generic";
  if (UNAVAILABLE_STATUSES.includes(error.status) || error.code === ApiErrorCode.ServiceUnavailable) return "unavailable";
  if (error.status === HttpStatus.TooManyRequests || error.code === ApiErrorCode.TooManyRequests) return "rateLimited";
  if (error.status === HttpStatus.Forbidden) return "forbidden";
  return "generic";
}

/** The identifier support can search the logs for: the backend request id, else Next's server-error digest. */
export function errorReference(error: unknown): string | undefined {
  if (error instanceof ApiClientError) return error.requestId;
  if (typeof error === "object" && error !== null && "digest" in error && typeof error.digest === "string" && error.digest !== "") {
    return error.digest;
  }
  return undefined;
}
