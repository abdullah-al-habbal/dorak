import { fetchPaginatedList } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardPage } from '@/shared/types/pagination';
import type { Branch } from '@/features/branches/types/branch';

export const listBranches = (params: ServerListParams): Promise<DashboardPage<Branch>> => fetchPaginatedList<Branch, ServerListParams>(DASHBOARD_API.branches, params);
