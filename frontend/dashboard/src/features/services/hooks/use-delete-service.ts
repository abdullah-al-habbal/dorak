import { deleteService } from '@/features/services/api';
import { SERVICE_QUERY_KEYS } from '@/features/services/hooks/service-query-keys';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useDeleteService() {
  return useInvalidatingMutation({ mutationFn: deleteService }, [SERVICE_QUERY_KEYS.all]);
}
