import { HttpStatus } from "@/enums/http-status.enum";
import { ApiClientError } from "@/services/api/core/api-client-error";

/** A 409 carries the backend's reason in the request language; anything else shows the fallback. */
export function conflictMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError && error.status === HttpStatus.Conflict && error.message) return error.message;
  return fallback;
}
