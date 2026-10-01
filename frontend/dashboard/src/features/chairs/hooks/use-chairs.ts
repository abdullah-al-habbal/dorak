import { useQuery } from '@tanstack/react-query';
import { listChairs } from '@/features/chairs/api';
import { CHAIR_QUERY_KEYS } from '@/features/chairs/hooks/chair-query-keys';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
export const useChairs = (params: ServerListParams) => useQuery({ queryFn: () => listChairs(params), queryKey: CHAIR_QUERY_KEYS.list(params) });
