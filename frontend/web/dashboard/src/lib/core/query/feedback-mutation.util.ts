import type { QueryClient, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import type { FeedbackMutationOptions } from "@/interfaces/core/query/feedback-mutation-options.interface";

/** Toasts the outcome, then refreshes every listed query root once the mutation settles. */
export function feedbackMutationOptions<TData, TVariables>(
  client: QueryClient,
  { mutationFn, invalidate, successMessage, errorMessage }: FeedbackMutationOptions<TData, TVariables>,
): UseMutationOptions<TData, Error, TVariables> {
  return {
    mutationFn,
    onSuccess: (data, variables) => toast.success(successMessage(data, variables)),
    onError: errorMessage === undefined ? undefined : (error) => toast.error(errorMessage(error)),
    onSettled: async () => {
      await Promise.all(invalidate.map((queryKey) => client.invalidateQueries({ queryKey })));
    },
  };
}
