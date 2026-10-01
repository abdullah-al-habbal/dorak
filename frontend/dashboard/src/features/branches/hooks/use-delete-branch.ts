import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBranch } from '@/features/branches/api';
import { invalidateBranchViews } from '@/features/branches/hooks/branch-query-keys';

export function useDeleteBranch() { const client = useQueryClient(); return useMutation({ mutationFn: deleteBranch, onSuccess: () => invalidateBranchViews(client) }); }
