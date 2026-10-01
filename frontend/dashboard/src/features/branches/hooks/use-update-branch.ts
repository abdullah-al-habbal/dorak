import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBranch } from '@/features/branches/api';
import { invalidateBranchViews } from '@/features/branches/hooks/branch-query-keys';
import type { UpdateBranchInput } from '@/features/branches/schemas/branch.schema';

export function useUpdateBranch() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateBranchInput }) => updateBranch(id, input), onSuccess: () => invalidateBranchViews(client) }); }
