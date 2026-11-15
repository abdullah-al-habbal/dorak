import { HttpStatus } from "@/enums/access/http-status.enum";
import { ApiClientError } from "@/services/api/core/api-client-error";

interface BookingStatusErrorMessages {
  conflict: string;
  invalid: string;
  failed: string;
}

/** A 409 means the booking moved elsewhere, a 400 that the transition is not allowed; anything else is generic. */
export function bookingStatusErrorMessage(error: unknown, messages: BookingStatusErrorMessages): string {
  const status = error instanceof ApiClientError ? error.status : 0;
  if (status === HttpStatus.Conflict) return messages.conflict;
  if (status === HttpStatus.BadRequest) return messages.invalid;
  return messages.failed;
}
