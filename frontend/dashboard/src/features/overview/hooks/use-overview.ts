import { useQuery } from '@tanstack/react-query';
import { getOverview } from '@/features/overview/api';
export const useOverview = () =>
  useQuery({ queryFn: getOverview, queryKey: ['dashboard', 'overview'] });
