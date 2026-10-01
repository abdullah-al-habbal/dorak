import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateChair } from '@/features/chairs/api';
import { chairConflictMessage, invalidateChairViews } from '@/features/chairs/hooks/chair-query-keys';
import type { ChairInput } from '@/features/chairs/schemas/chair.schema';

export function useUpdateChair() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: ChairInput }) => updateChair(id, input), onError: chairConflictMessage, onSuccess: () => invalidateChairViews(client) }); }
