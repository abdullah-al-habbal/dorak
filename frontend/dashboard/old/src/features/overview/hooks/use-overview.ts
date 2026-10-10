import { useQuery } from '@tanstack/react-query';
import { getOverview } from '@/features/overview/api';
export function useOverview() {
  return useQuery({ queryFn: getOverview, queryKey: ['dashboard', 'overview'] });
}
