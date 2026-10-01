import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Booking, WalkInBookingInput } from '@/features/bookings/types/booking';

export const createWalkInBooking = (input: WalkInBookingInput): Promise<Booking> => dashboardApi(DASHBOARD_API.walkInBookings, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'POST' });
