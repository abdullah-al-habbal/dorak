import { useQuery } from '@tanstack/react-query';
import { getBranch } from '@/features/branches/api';
import { BRANCH_QUERY_KEYS } from '@/features/branches/hooks/branch-query-keys';

export const useBranch = (id: string) => useQuery({ enabled: id !== '', queryFn: () => getBranch(id), queryKey: BRANCH_QUERY_KEYS.detail(id) });
