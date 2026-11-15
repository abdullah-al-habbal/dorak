"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";

import type { FeedbackMutationOptions } from "@/interfaces/core/feedback-mutation-options.interface";
import { feedbackMutationOptions } from "@/lib/feedback-mutation.util";

/** Shared write flow: success toast, optional error toast, then a refresh of every listed query root. */
export function useFeedbackMutation<TData, TVariables>(options: FeedbackMutationOptions<TData, TVariables>): UseMutationResult<TData, Error, TVariables> {
  const client = useQueryClient();
  return useMutation(feedbackMutationOptions(client, options));
}
