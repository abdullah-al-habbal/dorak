import { dashboardApi } from '@/shared/api/client';
import type { BookingStatusInput } from '@/features/bookings/schemas/booking-status.schema';
import type { Booking, PaginatedBookings } from '@/features/bookings/types/booking';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export function listBookings(): Promise<PaginatedBookings> {
  return dashboardApi<PaginatedBookings>(DASHBOARD_API.bookings);
}

export function updateBookingStatus(id: string, input: BookingStatusInput): Promise<Booking> {
  return dashboardApi<Booking>(`${DASHBOARD_API.bookings}/${id}`, {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'PATCH',
  });
}
