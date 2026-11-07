"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import type { SaveMutationOptions } from "@/interfaces/save-mutation-options.interface";
import type { SaveVariables } from "@/interfaces/save-variables.interface";

/** Shared create-or-update flow: the form maps errors, this toasts success and refreshes the listed roots. */
export function useSaveMutation<P, R>({ create, update, invalidate, messages }: SaveMutationOptions<P, R>): UseMutationResult<R, Error, SaveVariables<P>> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: SaveVariables<P>) => (id ? update(id, payload) : create(payload)),
    onSuccess: (_data, { id }) => toast.success(id ? messages.updated : messages.created),
    onSettled: async () => {
      await Promise.all(invalidate.map((queryKey) => client.invalidateQueries({ queryKey })));
    },
  });
}
