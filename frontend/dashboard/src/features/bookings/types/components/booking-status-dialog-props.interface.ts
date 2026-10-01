import type { BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';
import type { Booking } from '@/features/bookings/types/booking';

export interface BookingStatusDialogProps {
  booking: Booking;
  isPending: boolean;
  onSubmit: (input: BookingStatusInput) => void;
}
