import type { BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';
import type { Booking } from '@/features/bookings/types/booking';
import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const updateBookingStatus = (id: string, input: BookingStatusInput): Promise<Booking> =>
  mutateEntity<BookingStatusInput, Booking>(`${DASHBOARD_API.bookings}/${id}`, 'PATCH', input);
