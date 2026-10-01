import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBookingStatus } from '@/features/bookings/api';
import { invalidateBookingViews } from '@/features/bookings/hooks/booking-query-keys';
import type { BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';

export function useUpdateBookingStatus() { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: BookingStatusInput }) => updateBookingStatus(id, input), onSuccess: () => invalidateBookingViews(queryClient) }); }
