import { fetchPaginatedList } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardPage } from '@/shared/types/pagination';
import type { Stylist } from '@/features/stylists/types/stylist';

export const listStylists = (params: ServerListParams): Promise<DashboardPage<Stylist>> => fetchPaginatedList<Stylist, ServerListParams>(DASHBOARD_API.stylists, params);
