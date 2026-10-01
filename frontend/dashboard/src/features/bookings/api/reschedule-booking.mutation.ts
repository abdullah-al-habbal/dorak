import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Booking } from '@/features/bookings/types/booking';

export const rescheduleBooking = (id: string, input: { ends_at: string; time_slot: string }): Promise<Booking> => dashboardApi(`${DASHBOARD_API.bookings}/${id}/reschedule`, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'PATCH' });
