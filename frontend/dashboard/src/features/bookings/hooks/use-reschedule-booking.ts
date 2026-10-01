import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rescheduleBooking } from '@/features/bookings/api';
import { invalidateBookingViews } from '@/features/bookings/hooks/booking-query-keys';

export function useRescheduleBooking() { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: { ends_at: string; time_slot: string } }) => rescheduleBooking(id, input), onSuccess: () => invalidateBookingViews(queryClient) }); }
