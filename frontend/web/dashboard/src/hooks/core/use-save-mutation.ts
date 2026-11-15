"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import type { SaveMutationOptions } from "@/interfaces/core/save-mutation-options.interface";
import type { SaveVariables } from "@/interfaces/core/save-variables.interface";
import { saveFeedbackOptions } from "@/lib/core/save-mutation.util";

/** Shared create-or-update flow: the form maps errors, this toasts success and refreshes the listed roots. */
export function useSaveMutation<P, R>(options: SaveMutationOptions<P, R>): UseMutationResult<R, Error, SaveVariables<P>> {
  return useFeedbackMutation(saveFeedbackOptions(options));
}
