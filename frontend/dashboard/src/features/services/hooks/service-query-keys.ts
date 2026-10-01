import type { QueryClient } from '@tanstack/react-query';

export const SERVICE_QUERY_KEYS = { all: ['dashboard', 'services'] as const, detail: (id: string) => ['dashboard', 'services', id] as const, list: <TParams extends object>(params: TParams) => ['dashboard', 'services', params] as const };
export function invalidateServiceViews(queryClient: QueryClient): void { queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEYS.all }); }
