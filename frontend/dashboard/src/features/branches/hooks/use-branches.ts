import { useQuery } from '@tanstack/react-query';
import { listBranches } from '@/features/branches/api';
import { BRANCH_QUERY_KEYS } from '@/features/branches/hooks/branch-query-keys';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
export const useBranches = (params: ServerListParams) => useQuery({ queryFn: () => listBranches(params), queryKey: BRANCH_QUERY_KEYS.list(params) });
