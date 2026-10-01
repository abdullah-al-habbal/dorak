import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Booking } from '@/features/bookings/types/booking';

export const getBooking = (id: string): Promise<Booking> => dashboardApi(`${DASHBOARD_API.bookings}/${id}`);
