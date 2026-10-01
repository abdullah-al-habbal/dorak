import { updateChair } from '@/features/chairs/api';
import { chairConflictMessage, CHAIR_QUERY_KEYS } from '@/features/chairs/hooks/chair-query-keys';
import type { ChairInput } from '@/features/chairs/schemas/chair.schema';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useUpdateChair() { return useInvalidatingMutation({ mutationFn: ({ id, input }: { id: string; input: ChairInput }) => updateChair(id, input), onError: chairConflictMessage }, [CHAIR_QUERY_KEYS.all]); }
