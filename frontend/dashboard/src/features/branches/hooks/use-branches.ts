import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBranch, deleteBranch, getBranch, listBranches, updateBranch } from '@/features/branches/api/branches.api';
import type { CreateBranchInput, UpdateBranchInput } from '@/features/branches/schemas/branch.schema';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
const branchKey = ['dashboard', 'branches'] as const;
export const useBranches = (params: ServerListParams) => useQuery({ queryFn: () => listBranches(params), queryKey: [...branchKey, params] });
export const useBranch = (id: string) => useQuery({ enabled: id !== '', queryFn: () => getBranch(id), queryKey: [...branchKey, id] });
export function useCreateBranch() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateBranchInput) => createBranch(input), onSuccess: () => client.invalidateQueries({ queryKey: branchKey }) }); }
export function useUpdateBranch() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateBranchInput }) => updateBranch(id, input), onSuccess: () => client.invalidateQueries({ queryKey: branchKey }) }); }
export function useDeleteBranch() { const client = useQueryClient(); return useMutation({ mutationFn: deleteBranch, onSuccess: () => client.invalidateQueries({ queryKey: branchKey }) }); }
