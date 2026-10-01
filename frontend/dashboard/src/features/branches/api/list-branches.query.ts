import type { Branch } from '@/features/branches/types/branch';
import { fetchPaginatedList } from '@/shared/api';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { DashboardPage } from '@/shared/types/pagination';

export const listBranches = (params: ServerListParams): Promise<DashboardPage<Branch>> =>
  fetchPaginatedList<Branch, ServerListParams>(DASHBOARD_API.branches, params);
