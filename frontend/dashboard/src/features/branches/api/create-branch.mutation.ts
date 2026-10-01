import { mutateEntity } from '@/shared/api';
import { DASHBOARD_API } from '@/shared/routes/dashboard-routes';
import type { CreateBranchInput } from '@/features/branches/schemas/branch.schema';
import type { Branch } from '@/features/branches/types/branch';

export const createBranch = (input: CreateBranchInput): Promise<Branch> => mutateEntity<CreateBranchInput, Branch>(DASHBOARD_API.branches, 'POST', input);
