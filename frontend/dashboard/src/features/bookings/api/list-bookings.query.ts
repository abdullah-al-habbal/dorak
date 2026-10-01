import { fetchPaginatedList } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardPage } from '@/shared/types/pagination';
import type { Booking } from '@/features/bookings/types/booking';

export const listBookings = (params: ServerListParams & { chair_id?: string; date_from?: string; date_to?: string; status?: string; stylist_id?: string }): Promise<DashboardPage<Booking>> => fetchPaginatedList<Booking, typeof params>(DASHBOARD_API.bookings, params);
