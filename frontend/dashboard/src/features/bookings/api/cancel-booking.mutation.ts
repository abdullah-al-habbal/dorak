import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Booking } from '@/features/bookings/types/booking';

export const cancelBooking = (id: string): Promise<Booking> => mutateEntity<never, Booking>(`${DASHBOARD_API.bookings}/${id}/cancel`, 'PATCH');
