import { updateBookingStatus } from '@/features/bookings/api';
import { BOOKINGS_QUERY_KEYS } from '@/features/bookings/hooks/booking-query-keys';
import type { BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useUpdateBookingStatus() { return useInvalidatingMutation({ mutationFn: ({ id, input }: { id: string; input: BookingStatusInput }) => updateBookingStatus(id, input) }, [BOOKINGS_QUERY_KEYS.all, BOOKINGS_QUERY_KEYS.overview, BOOKINGS_QUERY_KEYS.chairs]); }
