import { deleteChair } from '@/features/chairs/api';
import { chairConflictMessage, CHAIR_QUERY_KEYS } from '@/features/chairs/hooks/chair-query-keys';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useDeleteChair() {
  return useInvalidatingMutation({ mutationFn: deleteChair, onError: chairConflictMessage }, [
    CHAIR_QUERY_KEYS.all,
  ]);
}
