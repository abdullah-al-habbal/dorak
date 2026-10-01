import type { Stylist } from '@/features/stylists/types/stylist';
import { fetchPaginatedList } from '@/shared/api';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { DashboardPage } from '@/shared/types/pagination';

export const listStylists = (params: ServerListParams): Promise<DashboardPage<Stylist>> =>
  fetchPaginatedList<Stylist, ServerListParams>(DASHBOARD_API.stylists, params);
