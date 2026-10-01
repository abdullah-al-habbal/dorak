import type { Booking } from '@/features/bookings/types/booking';
import { fetchEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const getBooking = (id: string): Promise<Booking> =>
  fetchEntity<Booking>(DASHBOARD_API.bookings, id);
