import type { BookingStatus } from '@/features/bookings/types/booking';

export interface BookingActionsDialogProps {
  bookingId: string;
  status?: BookingStatus;
}
