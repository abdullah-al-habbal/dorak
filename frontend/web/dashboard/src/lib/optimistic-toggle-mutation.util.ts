import type { QueryClient, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import type { OptimisticToggleContext } from "@/interfaces/optimistic-toggle-context.interface";
import type { OptimisticToggleMutationOptions } from "@/interfaces/optimistic-toggle-mutation-options.interface";

/** Patches every cached entry under the root at once, restores the snapshots on failure, then refetches it (and any extra roots). */
export function optimisticToggleMutationOptions<TData, TVariables, TCache>(
  client: QueryClient,
  { queryKey, mutationFn, patch, successMessage, failureMessage, invalidate = [] }: OptimisticToggleMutationOptions<TData, TVariables, TCache>,
): UseMutationOptions<TData, Error, TVariables, OptimisticToggleContext<TCache>> {
  return {
    mutationFn,
    onMutate: async (variables) => {
      await client.cancelQueries({ queryKey });
      const snapshots = client.getQueriesData<TCache>({ queryKey });
      client.setQueriesData<TCache>({ queryKey }, (cached) => patch(cached, variables));
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) => client.setQueryData(key, data));
      if (failureMessage !== undefined) toast.error(failureMessage);
    },
    onSuccess: (_data, variables) => toast.success(successMessage(variables)),
    onSettled: () => Promise.all([queryKey, ...invalidate].map((root) => client.invalidateQueries({ queryKey: root }))),
  };
}
