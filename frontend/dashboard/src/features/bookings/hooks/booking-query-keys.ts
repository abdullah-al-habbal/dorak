import type { QueryClient } from '@tanstack/react-query';

export const BOOKINGS_QUERY_KEYS = { all: ['dashboard', 'bookings'] as const, chairs: ['dashboard', 'chairs'] as const, detail: (id: string) => ['dashboard', 'bookings', id] as const, list: <TParams extends object>(params: TParams) => ['dashboard', 'bookings', params] as const, overview: ['dashboard', 'overview'] as const };
export function invalidateBookingViews(queryClient: QueryClient): void { queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEYS.all }); queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEYS.overview }); queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEYS.chairs }); }
