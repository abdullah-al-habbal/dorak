import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { Branch } from '@/features/branches/types/branch';

export const getBranch = (id: string): Promise<Branch> => dashboardApi(`${DASHBOARD_API.branches}/${id}`);
