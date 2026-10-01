import { createService } from '@/features/services/api';
import { SERVICE_QUERY_KEYS } from '@/features/services/hooks/service-query-keys';
import type { ServiceInput } from '@/features/services/schemas/service.schema';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useCreateService() {
  return useInvalidatingMutation({ mutationFn: (input: ServiceInput) => createService(input) }, [
    SERVICE_QUERY_KEYS.all,
  ]);
}
