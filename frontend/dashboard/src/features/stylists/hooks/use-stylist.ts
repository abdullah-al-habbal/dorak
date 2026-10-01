import { useQuery } from '@tanstack/react-query';
import { getStylist } from '@/features/stylists/api';
import { STYLIST_QUERY_KEYS } from '@/features/stylists/hooks/stylist-query-keys';

export const useStylist = (id: string) =>
  useQuery({
    enabled: id !== '',
    queryFn: () => getStylist(id),
    queryKey: STYLIST_QUERY_KEYS.detail(id),
  });
