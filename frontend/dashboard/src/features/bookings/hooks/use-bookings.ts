import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listBookings, updateBookingStatus } from '@/features/bookings/api/bookings.api';
import type { BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';

const bookingsQueryKey = ['dashboard', 'bookings'] as const;

export function useBookings() {
  return useQuery({ queryFn: listBookings, queryKey: bookingsQueryKey });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BookingStatusInput }) => updateBookingStatus(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingsQueryKey }),
  });
}
