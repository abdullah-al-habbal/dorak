import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '@/features/bookings/api';
import { invalidateBookingViews } from '@/features/bookings/hooks/booking-query-keys';

export function useCancelBooking() { const queryClient = useQueryClient(); return useMutation({ mutationFn: cancelBooking, onSuccess: () => invalidateBookingViews(queryClient) }); }
