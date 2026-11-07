"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import type { DeleteMutationOptions } from "@/interfaces/delete-mutation-options.interface";
import { conflictMessage } from "@/lib/conflict-message.util";

/** Shared delete flow: toast the outcome, then refresh every listed query root. */
export function useDeleteMutation({ remove, invalidate, messages, surfaceConflict = false }: DeleteMutationOptions): UseMutationResult<void, Error, string> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: remove,
    onSuccess: () => toast.success(messages.deleted),
    onError: (error) => toast.error(surfaceConflict ? conflictMessage(error, messages.deleteFailed) : messages.deleteFailed),
    onSettled: async () => {
      await Promise.all(invalidate.map((queryKey) => client.invalidateQueries({ queryKey })));
    },
  });
}
