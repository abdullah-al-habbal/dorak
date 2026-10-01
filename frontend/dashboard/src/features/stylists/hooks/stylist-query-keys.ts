import type { QueryClient } from '@tanstack/react-query';

export const STYLIST_QUERY_KEYS = { all: ['dashboard', 'stylists'] as const, detail: (id: string) => ['dashboard', 'stylists', id] as const, list: <TParams extends object>(params: TParams) => ['dashboard', 'stylists', params] as const };
export function invalidateStylistViews(queryClient: QueryClient): void { queryClient.invalidateQueries({ queryKey: STYLIST_QUERY_KEYS.all }); }
