"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useDictionary } from "@/hooks/use-dictionary";
import type { ApiSuccessCopyKey } from "@/services/api/core/types/api-mutation.types";
import { notifySuccess } from "@/services/api/core/notifications";

type ApiMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  "onSuccess"
> & {
  successMessage?: ApiSuccessCopyKey;
  onSuccess?: UseMutationOptions<TData, Error, TVariables>["onSuccess"];
};

/** Mutation baseline: global cache reports failures; this hook reports translated success. */
export function useApiMutation<TData, TVariables>(
  options: ApiMutationOptions<TData, TVariables>,
) {
  const { successMessage, onSuccess, ...mutationOptions } = options;
  const copy = useDictionary().common.apiSuccess;

  return useMutation({
    ...mutationOptions,
    onSuccess: async (data, variables, context, mutationContext) => {
      if (successMessage) notifySuccess(copy[successMessage]);
      await onSuccess?.(data, variables, context, mutationContext);
    },
  });
}
