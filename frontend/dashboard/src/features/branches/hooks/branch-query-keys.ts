import type { QueryClient } from '@tanstack/react-query';

export const BRANCH_QUERY_KEYS = { all: ['dashboard', 'branches'] as const, detail: (id: string) => ['dashboard', 'branches', id] as const, list: <TParams extends object>(params: TParams) => ['dashboard', 'branches', params] as const };
export function invalidateBranchViews(queryClient: QueryClient): void { queryClient.invalidateQueries({ queryKey: BRANCH_QUERY_KEYS.all }); }
