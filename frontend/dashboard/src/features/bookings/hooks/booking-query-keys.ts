import { createQueryKeys } from '@/shared/utils/query-keys';

export const BOOKINGS_QUERY_KEYS = { ...createQueryKeys(['dashboard', 'bookings']), chairs: ['dashboard', 'chairs'] as const, overview: ['dashboard', 'overview'] as const };
