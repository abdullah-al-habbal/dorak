import { useQuery } from '@tanstack/react-query';
import { listServices } from '@/features/services/api';
import { SERVICE_QUERY_KEYS } from '@/features/services/hooks/service-query-keys';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
export const useServices = (params: ServerListParams) =>
  useQuery({ queryFn: () => listServices(params), queryKey: SERVICE_QUERY_KEYS.list(params) });
