import { updateBranch } from '@/features/branches/api';
import { BRANCH_QUERY_KEYS } from '@/features/branches/hooks/branch-query-keys';
import type { UpdateBranchInput } from '@/features/branches/schemas/branch.schema';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useUpdateBranch() {
  return useInvalidatingMutation(
    {
      mutationFn: ({ id, input }: { id: string; input: UpdateBranchInput }) =>
        updateBranch(id, input),
    },
    [BRANCH_QUERY_KEYS.all],
  );
}
