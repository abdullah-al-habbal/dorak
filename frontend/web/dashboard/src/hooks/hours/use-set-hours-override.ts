"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { hoursOverrideKeys } from "@/lib/query-keys/hours/hours-override-keys";
import { setHoursOverride } from "@/services/api/mutation/hours/hours-override.mutation";
import type { HoursOverride, HoursOverrideInput } from "@/types/hours/hours-override.type";

interface SetOverrideVariables {
  branchId: string;
  date: string;
  input: HoursOverrideInput;
}

/** Failures are rethrown to the form, which shows the reason inline. */
export function useSetHoursOverride(): UseMutationResult<HoursOverride, Error, SetOverrideVariables> {
  const { workingHours } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ branchId, date, input }: SetOverrideVariables) => setHoursOverride(branchId, date, input),
    invalidate: [hoursOverrideKeys.all],
    successMessage: () => workingHours.specialDays.toast.saved,
  });
}
