import { dashboardApiEnvelope } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardPage } from '@/shared/types/pagination';
import type { Booking } from '@/features/bookings/types/booking';

export async function listBookings(params: ServerListParams & { chair_id?: string; date_from?: string; date_to?: string; status?: string; stylist_id?: string }): Promise<DashboardPage<Booking>> {
  const query = new URLSearchParams({ page: String(params.page), per_page: String(params.per_page) });
  for (const [key, value] of Object.entries(params)) if (typeof value === 'string' && value !== '') query.set(key, value);
  const envelope = await dashboardApiEnvelope<Booking[]>(`${DASHBOARD_API.bookings}?${query.toString()}`);
  const pagination = envelope.meta?.pagination;
  return { items: envelope.data, pagination: { currentPage: pagination?.current_page ?? 1, perPage: pagination?.per_page ?? envelope.data.length, total: pagination?.total ?? envelope.data.length, totalPages: pagination?.total_pages ?? 1 } };
}
