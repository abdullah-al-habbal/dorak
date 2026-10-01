import { createBranch } from '@/features/branches/api';
import { BRANCH_QUERY_KEYS } from '@/features/branches/hooks/branch-query-keys';
import type { CreateBranchInput } from '@/features/branches/schemas/branch.schema';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useCreateBranch() { return useInvalidatingMutation({ mutationFn: (input: CreateBranchInput) => createBranch(input) }, [BRANCH_QUERY_KEYS.all]); }
