import { ApiClientError } from "@/services/api/core/client-error";
import { CHAIR_MAINTENANCE_CONFLICT_CODE } from "@/services/api/dashboard/chair/chair-maintenance-conflict.constant";

export function chairConflictBookingIds(error: unknown): string[] | null {
  if (
    !(error instanceof ApiClientError) ||
    error.status !== 409 ||
    error.code !== CHAIR_MAINTENANCE_CONFLICT_CODE
  )
    return null;
  return error.errors?.booking_ids ?? [];
}
