import { useQuery } from '@tanstack/react-query';
import { getBooking } from '@/features/bookings/api';
import { BOOKINGS_QUERY_KEYS } from '@/features/bookings/hooks/booking-query-keys';

export const useBooking = (id: string) => useQuery({ enabled: id !== '', queryFn: () => getBooking(id), queryKey: BOOKINGS_QUERY_KEYS.detail(id) });
