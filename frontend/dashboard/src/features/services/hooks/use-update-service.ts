import { updateService } from '@/features/services/api';
import { SERVICE_QUERY_KEYS } from '@/features/services/hooks/service-query-keys';
import type { ServiceInput } from '@/features/services/schemas/service.schema';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useUpdateService() {
  return useInvalidatingMutation(
    {
      mutationFn: ({ id, input }: { id: string; input: ServiceInput }) => updateService(id, input),
    },
    [SERVICE_QUERY_KEYS.all],
  );
}
