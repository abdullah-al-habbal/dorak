import type { UpdateBranchInput } from '@/features/branches/schemas/branch.schema';
import type { Branch } from '@/features/branches/types/branch';
import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';

export const updateBranch = (id: string, input: UpdateBranchInput): Promise<Branch> =>
  mutateEntity<UpdateBranchInput, Branch>(`${DASHBOARD_API.branches}/${id}`, 'PUT', input);
