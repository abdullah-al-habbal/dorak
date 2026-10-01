import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBranch } from '@/features/branches/api';
import { invalidateBranchViews } from '@/features/branches/hooks/branch-query-keys';
import type { CreateBranchInput } from '@/features/branches/schemas/branch.schema';

export function useCreateBranch() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateBranchInput) => createBranch(input), onSuccess: () => invalidateBranchViews(client) }); }
