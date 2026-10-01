import { rescheduleBooking } from '@/features/bookings/api';
import { BOOKINGS_QUERY_KEYS } from '@/features/bookings/hooks/booking-query-keys';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useRescheduleBooking() {
  return useInvalidatingMutation(
    {
      mutationFn: ({ id, input }: { id: string; input: { ends_at: string; time_slot: string } }) =>
        rescheduleBooking(id, input),
    },
    [BOOKINGS_QUERY_KEYS.all, BOOKINGS_QUERY_KEYS.overview, BOOKINGS_QUERY_KEYS.chairs],
  );
}
