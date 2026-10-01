import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { CreateBranchInput } from '@/features/branches/schemas/branch.schema';
import type { Branch } from '@/features/branches/types/branch';

export const createBranch = (input: CreateBranchInput): Promise<Branch> => dashboardApi(DASHBOARD_API.branches, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'POST' });
