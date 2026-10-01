import { useQuery } from '@tanstack/react-query';
import { listStylists } from '@/features/stylists/api';
import { STYLIST_QUERY_KEYS } from '@/features/stylists/hooks/stylist-query-keys';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
export const useStylists = (params: ServerListParams) =>
  useQuery({ queryFn: () => listStylists(params), queryKey: STYLIST_QUERY_KEYS.list(params) });
