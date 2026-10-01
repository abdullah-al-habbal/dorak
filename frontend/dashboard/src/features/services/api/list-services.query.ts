import { fetchPaginatedList } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardPage } from '@/shared/types/pagination';
import type { Service } from '@/features/services/types/service';

export const listServices = (params: ServerListParams): Promise<DashboardPage<Service>> => fetchPaginatedList<Service, ServerListParams>(DASHBOARD_API.services, params);
