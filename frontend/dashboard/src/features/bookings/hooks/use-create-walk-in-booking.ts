import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWalkInBooking } from '@/features/bookings/api';
import { invalidateBookingViews } from '@/features/bookings/hooks/booking-query-keys';

export function useCreateWalkInBooking() { const queryClient = useQueryClient(); return useMutation({ mutationFn: createWalkInBooking, onSuccess: () => invalidateBookingViews(queryClient) }); }
