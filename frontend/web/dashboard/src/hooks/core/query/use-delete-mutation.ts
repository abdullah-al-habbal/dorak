"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import type { DeleteMutationOptions } from "@/interfaces/core/query/delete-mutation-options.interface";
import { deleteFeedbackOptions } from "@/lib/core/query/delete-mutation.util";

/** Shared delete flow: toast the outcome, then refresh every listed query root. */
export function useDeleteMutation(options: DeleteMutationOptions): UseMutationResult<void, Error, string> {
  return useFeedbackMutation(deleteFeedbackOptions(options));
}
