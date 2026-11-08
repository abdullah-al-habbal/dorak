"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";

import type { OptimisticToggleContext } from "@/interfaces/optimistic-toggle-context.interface";
import type { OptimisticToggleMutationOptions } from "@/interfaces/optimistic-toggle-mutation-options.interface";
import { optimisticToggleMutationOptions } from "@/lib/optimistic-toggle-mutation.util";

/** Shared optimistic toggle: flips the record in every cached list at once, rolls back on failure, then refetches. */
export function useOptimisticToggleMutation<TData, TVariables, TCache>(
  options: OptimisticToggleMutationOptions<TData, TVariables, TCache>,
): UseMutationResult<TData, Error, TVariables, OptimisticToggleContext<TCache>> {
  const client = useQueryClient();
  return useMutation(optimisticToggleMutationOptions(client, options));
}
