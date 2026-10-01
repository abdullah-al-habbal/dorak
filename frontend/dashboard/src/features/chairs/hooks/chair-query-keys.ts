import { publishChairConflict } from '@/features/chairs/components/dialogs/chair-conflict-dialog';
import { isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { showWarning } from '@/shared/components/feedback/toast';
import { createQueryKeys } from '@/shared/utils/query-keys';

export const CHAIR_QUERY_KEYS = createQueryKeys(['dashboard', 'chairs']);
export function chairConflictMessage(error: unknown): void {
  if (isDashboardApiError(error) && error.status === 409) {
    publishChairConflict();
    showWarning('Chair changes are blocked by active or future bookings.');
  }
}
