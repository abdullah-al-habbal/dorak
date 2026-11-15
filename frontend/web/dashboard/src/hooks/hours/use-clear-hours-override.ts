"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { hoursOverrideKeys } from "@/lib/query-keys/hours/hours-override-keys";
import { clearHoursOverride } from "@/services/api/mutation/hours-override.mutation";

interface ClearOverrideVariables {
  branchId: string;
  date: string;
}

export function useClearHoursOverride(): UseMutationResult<void, Error, ClearOverrideVariables> {
  const { workingHours } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ branchId, date }: ClearOverrideVariables) => clearHoursOverride(branchId, date),
    invalidate: [hoursOverrideKeys.all],
    successMessage: () => workingHours.specialDays.toast.removed,
    errorMessage: () => workingHours.specialDays.toast.failed,
  });
}
