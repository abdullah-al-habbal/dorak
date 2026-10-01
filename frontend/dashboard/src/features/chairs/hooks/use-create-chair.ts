import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChair } from '@/features/chairs/api';
import { invalidateChairViews } from '@/features/chairs/hooks/chair-query-keys';
import type { ChairInput } from '@/features/chairs/schemas/chair.schema';

export function useCreateChair() { const client = useQueryClient(); return useMutation({ mutationFn: (input: ChairInput) => createChair(input), onSuccess: () => invalidateChairViews(client) }); }
