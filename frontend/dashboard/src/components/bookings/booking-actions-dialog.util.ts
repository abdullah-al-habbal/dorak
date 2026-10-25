import { apiErrorMessage } from "@/services/api/api-error-message.util";
import { ApiClientError } from "@/services/api/client-error";
import type { Dictionary } from "@/i18n/dictionary.types";

interface IBookingConflictCopy {
  conflict: string;
  invalidTransition: string;
  outsideSchedule: string;
}

/** User-facing message for a booking reschedule/status/cancel mutation error. */
export function conflictMessage(
  error: unknown,
  copy: IBookingConflictCopy,
  dictionary: Dictionary,
): string {
  if (
    error instanceof ApiClientError &&
    error.code === "booking_outside_schedule"
  )
    return copy.outsideSchedule;
  if (error instanceof ApiClientError && error.status === 409)
    return copy.conflict;
  if (error instanceof ApiClientError && error.status === 422)
    return copy.invalidTransition;
  return apiErrorMessage(error, dictionary);
}

/** Converts a `datetime-local` input value to an ISO-8601 string. */
export function toIsoDateTime(value: string): string {
  return new Date(value).toISOString();
}
