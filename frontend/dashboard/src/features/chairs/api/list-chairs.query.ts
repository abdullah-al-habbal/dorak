import { fetchPaginatedList } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardPage } from '@/shared/types/pagination';
import type { Chair } from '@/features/chairs/types/chair';

export const listChairs = (params: ServerListParams): Promise<DashboardPage<Chair>> => fetchPaginatedList<Chair, ServerListParams>(DASHBOARD_API.chairs, params);
