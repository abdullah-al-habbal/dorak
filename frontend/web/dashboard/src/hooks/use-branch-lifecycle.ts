"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { BranchLifecycleAction } from "@/enums/branch-lifecycle-action.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import type { BranchLifecyclePayload } from "@/interfaces/branch-lifecycle-payload.interface";
import { brandHistoryKeys } from "@/lib/brand-history-keys";
import { branchKeys } from "@/lib/branch-keys";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { transitionBranch } from "@/services/api/mutation/branch-lifecycle.mutation";
import type { Branch } from "@/types/branch.type";

const TOAST_BY_ACTION = {
  [BranchLifecycleAction.SwitchOn]: "switchedOn",
  [BranchLifecycleAction.SwitchOff]: "switchedOff",
  [BranchLifecycleAction.Suspend]: "suspended",
  [BranchLifecycleAction.Reactivate]: "reactivated",
} as const;

/** Switch on/off (owner, manager) and suspend/reactivate (admin). A rejected move toasts the backend's reason. */
export function useBranchLifecycle(): UseMutationResult<Branch, Error, BranchLifecyclePayload> {
  const { branches } = useDictionary();
  return useFeedbackMutation({
    mutationFn: transitionBranch,
    invalidate: [branchKeys.all, brandHistoryKeys.all],
    successMessage: (_branch, { action }) => branches.lifecycle.toast[TOAST_BY_ACTION[action]],
    errorMessage: (error) => (error instanceof ApiClientError && error.message ? error.message : branches.lifecycle.toast.failed),
  });
}
