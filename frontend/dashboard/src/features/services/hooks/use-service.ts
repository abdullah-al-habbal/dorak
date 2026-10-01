import { useQuery } from '@tanstack/react-query';
import { getService } from '@/features/services/api';
import { SERVICE_QUERY_KEYS } from '@/features/services/hooks/service-query-keys';

export const useService = (id: string) =>
  useQuery({
    enabled: id !== '',
    queryFn: () => getService(id),
    queryKey: SERVICE_QUERY_KEYS.detail(id),
  });
