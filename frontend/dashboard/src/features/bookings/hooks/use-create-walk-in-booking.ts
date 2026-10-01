import { createWalkInBooking } from '@/features/bookings/api';
import { BOOKINGS_QUERY_KEYS } from '@/features/bookings/hooks/booking-query-keys';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useCreateWalkInBooking() {
  return useInvalidatingMutation({ mutationFn: createWalkInBooking }, [
    BOOKINGS_QUERY_KEYS.all,
    BOOKINGS_QUERY_KEYS.overview,
    BOOKINGS_QUERY_KEYS.chairs,
  ]);
}
