import type { Booking } from '@/features/bookings/types/booking';
import { fetchPaginatedList } from '@/shared/api';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { DashboardPage } from '@/shared/types/pagination';

export const listBookings = (
  params: ServerListParams & {
    chair_id?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    status?: string | undefined;
    stylist_id?: string | undefined;
  },
): Promise<DashboardPage<Booking>> =>
  fetchPaginatedList<Booking, typeof params>(DASHBOARD_API.bookings, params);
