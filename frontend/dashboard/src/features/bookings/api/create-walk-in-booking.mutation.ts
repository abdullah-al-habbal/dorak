import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Booking, WalkInBookingInput } from '@/features/bookings/types/booking';

export const createWalkInBooking = (input: WalkInBookingInput): Promise<Booking> => mutateEntity<WalkInBookingInput, Booking>(DASHBOARD_API.walkInBookings, 'POST', input);
