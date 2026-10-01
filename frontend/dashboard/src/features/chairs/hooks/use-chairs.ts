import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createChair, deleteChair, getChair, listChairs, updateChair } from '@/features/chairs/api';
import type { ChairInput } from '@/features/chairs/schemas/chair.schema';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import { isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { showWarning } from '@/shared/components/feedback/toast';
import { publishChairConflict } from '@/features/chairs/components/dialogs/chair-conflict-dialog';
const chairKey = ['dashboard', 'chairs'] as const;
export const useChairs = (params: ServerListParams) => useQuery({ queryFn: () => listChairs(params), queryKey: [...chairKey, params] });
export function useCreateChair() { const client = useQueryClient(); return useMutation({ mutationFn: (input: ChairInput) => createChair(input), onSuccess: () => client.invalidateQueries({ queryKey: chairKey }) }); }
export const useChair = (id: string) => useQuery({ enabled: id !== '', queryFn: () => getChair(id), queryKey: [...chairKey, id] });
function chairConflictMessage(error: unknown): void { if (isDashboardApiError(error) && error.status === 409) { publishChairConflict(); showWarning('Chair changes are blocked by active or future bookings.'); } }
export function useUpdateChair() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: ChairInput }) => updateChair(id, input), onError: chairConflictMessage, onSuccess: () => client.invalidateQueries({ queryKey: chairKey }) }); }
export function useDeleteChair() { const client = useQueryClient(); return useMutation({ mutationFn: deleteChair, onError: chairConflictMessage, onSuccess: () => client.invalidateQueries({ queryKey: chairKey }) }); }
