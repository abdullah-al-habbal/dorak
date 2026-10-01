import type { Branch } from '@/features/branches/types/branch';
import { fetchEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const getBranch = (id: string): Promise<Branch> =>
  fetchEntity<Branch>(DASHBOARD_API.branches, id);
