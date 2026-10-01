import { fetchEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Booking } from '@/features/bookings/types/booking';

export const getBooking = (id: string): Promise<Booking> => fetchEntity<Booking>(DASHBOARD_API.bookings, id);
