import { ApiClientError } from "@/services/api/core/client-error";

const CHAIR_CONFLICT_CODE = "CHAIR_HAS_ACTIVE_BOOKINGS";

export function chairConflictBookingIds(error: unknown): string[] | null {
  if (
    !(error instanceof ApiClientError) ||
    error.status !== 409 ||
    error.code !== CHAIR_CONFLICT_CODE
  )
    return null;
  return error.errors?.booking_ids ?? [];
}
