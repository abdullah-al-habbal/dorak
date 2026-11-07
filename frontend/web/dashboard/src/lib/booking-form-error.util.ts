import { HttpStatus } from "@/enums/http-status.enum";
import { ApiClientError } from "@/services/api/core/api-client-error";

const OUTSIDE_SCHEDULE_CODE = "booking_outside_schedule";

export interface BookingFormErrorMessages {
  conflict: string;
  outsideSchedule: string;
  generic: string;
}

export interface MappedFormError {
  /** Messages keyed by the form field they belong under. */
  fieldErrors: Record<string, string>;
  /** Shown in the form-level alert when no field owns the problem. */
  formError?: string;
}

/**
 * Turns a failed booking write into inline field errors where the backend names a field,
 * and a form-level message otherwise. Never echoes arbitrary server text for conflicts.
 */
export function mapBookingFormError(error: unknown, messages: BookingFormErrorMessages, startField: string): MappedFormError {
  if (!(error instanceof ApiClientError)) return { fieldErrors: {}, formError: messages.generic };
  if (error.status === HttpStatus.Conflict) return { fieldErrors: { [startField]: messages.conflict } };
  if (error.code === OUTSIDE_SCHEDULE_CODE) return { fieldErrors: { [startField]: messages.outsideSchedule } };
  if (error.status === HttpStatus.Unprocessable && error.fields) {
    const fieldErrors: Record<string, string> = {};
    for (const [name, list] of Object.entries(error.fields)) {
      const first = list[0];
      if (first) fieldErrors[name.replace(/\.\d+$/, "")] = first;
    }
    if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  }
  return { fieldErrors: {}, formError: messages.generic };
}
