import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions } from '@tanstack/react-query';

export function useInvalidatingMutation<TData, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryKeys: readonly QueryKey[]) {
  const queryClient = useQueryClient();
  return useMutation({ ...options, onSuccess: async (data, variables, context, onMutateResult) => { await options.onSuccess?.(data, variables, context, onMutateResult); await Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))); } });
}
