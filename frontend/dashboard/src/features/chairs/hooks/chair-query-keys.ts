import type { QueryClient } from '@tanstack/react-query';
import { isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { showWarning } from '@/shared/components/feedback/toast';
import { publishChairConflict } from '@/features/chairs/components/dialogs/chair-conflict-dialog';

export const CHAIR_QUERY_KEYS = { all: ['dashboard', 'chairs'] as const, detail: (id: string) => ['dashboard', 'chairs', id] as const, list: <TParams extends object>(params: TParams) => ['dashboard', 'chairs', params] as const };
export function invalidateChairViews(queryClient: QueryClient): void { queryClient.invalidateQueries({ queryKey: CHAIR_QUERY_KEYS.all }); }
export function chairConflictMessage(error: unknown): void { if (isDashboardApiError(error) && error.status === 409) { publishChairConflict(); showWarning('Chair changes are blocked by active or future bookings.'); } }
