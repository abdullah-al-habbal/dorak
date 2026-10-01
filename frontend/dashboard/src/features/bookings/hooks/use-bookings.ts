import { useQuery } from '@tanstack/react-query';
import { listBookings } from '@/features/bookings/api';
import { BOOKINGS_QUERY_KEYS } from '@/features/bookings/hooks/booking-query-keys';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';

export function useBookings(
  params: ServerListParams & {
    chair_id?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    status?: string | undefined;
    stylist_id?: string | undefined;
  },
) {
  return useQuery({
    queryFn: () => listBookings(params),
    queryKey: BOOKINGS_QUERY_KEYS.list(params),
  });
}
