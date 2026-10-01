import type { Service } from '@/features/services/types/service';
import { fetchPaginatedList } from '@/shared/api';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { DashboardPage } from '@/shared/types/pagination';

export const listServices = (params: ServerListParams): Promise<DashboardPage<Service>> =>
  fetchPaginatedList<Service, ServerListParams>(DASHBOARD_API.services, params);
