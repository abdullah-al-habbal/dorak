import { dashboardApi } from '@/shared/api/client';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { UpdateBranchInput } from '@/features/branches/schemas/branch.schema';
import type { Branch } from '@/features/branches/types/branch';

export const updateBranch = (id: string, input: UpdateBranchInput): Promise<Branch> => dashboardApi(`${DASHBOARD_API.branches}/${id}`, { body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' }, method: 'PUT' });
