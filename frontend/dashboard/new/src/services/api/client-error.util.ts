import { ApiClientError } from "@/services/api/client-error";

export function isServiceUnavailableError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.kind === "unreachable" || error.kind === "timeout" || error.status >= 500)
  );
}

export function isRetryableApiError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.status === 408 || error.status === 429 || error.status >= 500 || error.kind === "timeout")
  );
}

export function isAuthorizationError(error: unknown): boolean {
  return error instanceof ApiClientError && (error.status === 401 || error.status === 403);
}
