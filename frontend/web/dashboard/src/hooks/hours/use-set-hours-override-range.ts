"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { hoursOverrideKeys } from "@/lib/query-keys/hours/hours-override-keys";
import { setHoursOverrideRange } from "@/services/api/mutation/hours/hours-override.mutation";
import type { HoursOverride, HoursOverrideRangeInput } from "@/types/hours/hours-override.type";

interface SetRangeVariables {
  branchId: string;
  input: HoursOverrideRangeInput;
}

/** Failures are rethrown to the form, which shows the reason inline. */
export function useSetHoursOverrideRange(): UseMutationResult<HoursOverride[], Error, SetRangeVariables> {
  const { workingHours } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ branchId, input }: SetRangeVariables) => setHoursOverrideRange(branchId, input),
    invalidate: [hoursOverrideKeys.all],
    successMessage: (saved) => workingHours.specialDays.toast.savedRange.replace("{count}", String(saved.length)),
  });
}
