import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelBooking, createWalkInBooking, getBooking, listBookings, rescheduleBooking, updateBookingStatus } from '@/features/bookings/api';
import type { BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';

const bookingsQueryKey = ['dashboard', 'bookings'] as const;
const overviewQueryKey = ['dashboard', 'overview'] as const;
const chairsQueryKey = ['dashboard', 'chairs'] as const;

function invalidateBookingViews(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
  queryClient.invalidateQueries({ queryKey: overviewQueryKey });
  queryClient.invalidateQueries({ queryKey: chairsQueryKey });
}

export function useBookings(params: ServerListParams & { chair_id?: string; date_from?: string; date_to?: string; status?: string; stylist_id?: string }) {
  return useQuery({ queryFn: () => listBookings(params), queryKey: [...bookingsQueryKey, params] });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BookingStatusInput }) => updateBookingStatus(id, input),
    onSuccess: () => invalidateBookingViews(queryClient),
  });
}
export function useCreateWalkInBooking() { const queryClient = useQueryClient(); return useMutation({ mutationFn: createWalkInBooking, onSuccess: () => invalidateBookingViews(queryClient) }); }
export const useBooking = (id: string) => useQuery({ enabled: id !== '', queryFn: () => getBooking(id), queryKey: [...bookingsQueryKey, id] });
export function useCancelBooking() { const queryClient = useQueryClient(); return useMutation({ mutationFn: cancelBooking, onSuccess: () => invalidateBookingViews(queryClient) }); }
export function useRescheduleBooking() { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: { ends_at: string; time_slot: string } }) => rescheduleBooking(id, input), onSuccess: () => invalidateBookingViews(queryClient) }); }
