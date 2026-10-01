import { cancelBooking } from '@/features/bookings/api';
import { BOOKINGS_QUERY_KEYS } from '@/features/bookings/hooks/booking-query-keys';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useCancelBooking() { return useInvalidatingMutation({ mutationFn: cancelBooking }, [BOOKINGS_QUERY_KEYS.all, BOOKINGS_QUERY_KEYS.overview, BOOKINGS_QUERY_KEYS.chairs]); }
