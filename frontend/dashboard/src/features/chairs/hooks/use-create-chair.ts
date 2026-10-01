import { createChair } from '@/features/chairs/api';
import { CHAIR_QUERY_KEYS } from '@/features/chairs/hooks/chair-query-keys';
import type { ChairInput } from '@/features/chairs/schemas/chair.schema';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useCreateChair() {
  return useInvalidatingMutation({ mutationFn: (input: ChairInput) => createChair(input) }, [
    CHAIR_QUERY_KEYS.all,
  ]);
}
