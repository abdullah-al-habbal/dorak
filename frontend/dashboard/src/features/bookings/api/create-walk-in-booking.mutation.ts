import type { Booking, WalkInBookingInput } from '@/features/bookings/types/booking';
import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const createWalkInBooking = (input: WalkInBookingInput): Promise<Booking> =>
  mutateEntity<WalkInBookingInput, Booking>(DASHBOARD_API.walkInBookings, 'POST', input);
