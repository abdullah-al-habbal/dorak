import { useQuery } from '@tanstack/react-query';
import { getChair } from '@/features/chairs/api';
import { CHAIR_QUERY_KEYS } from '@/features/chairs/hooks/chair-query-keys';

export const useChair = (id: string) => useQuery({ enabled: id !== '', queryFn: () => getChair(id), queryKey: CHAIR_QUERY_KEYS.detail(id) });
