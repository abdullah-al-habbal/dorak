import { deleteBranch } from '@/features/branches/api';
import { BRANCH_QUERY_KEYS } from '@/features/branches/hooks/branch-query-keys';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useDeleteBranch() {
  return useInvalidatingMutation({ mutationFn: deleteBranch }, [BRANCH_QUERY_KEYS.all]);
}
