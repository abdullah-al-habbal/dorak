import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';
import type { Booking } from '@/features/bookings/types/booking';

export function updateBookingStatus(id: string, input: BookingStatusInput): Promise<Booking> {
  return dashboardApi<Booking>(`${DASHBOARD_API.bookings}/${id}`, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'PATCH' });
}
