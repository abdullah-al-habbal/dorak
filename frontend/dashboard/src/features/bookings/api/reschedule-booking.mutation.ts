import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Booking } from '@/features/bookings/types/booking';

export const rescheduleBooking = (id: string, input: { ends_at: string; time_slot: string }): Promise<Booking> => mutateEntity<typeof input, Booking>(`${DASHBOARD_API.bookings}/${id}/reschedule`, 'PATCH', input);
