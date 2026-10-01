import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteChair } from '@/features/chairs/api';
import { chairConflictMessage, invalidateChairViews } from '@/features/chairs/hooks/chair-query-keys';

export function useDeleteChair() { const client = useQueryClient(); return useMutation({ mutationFn: deleteChair, onError: chairConflictMessage, onSuccess: () => invalidateChairViews(client) }); }
