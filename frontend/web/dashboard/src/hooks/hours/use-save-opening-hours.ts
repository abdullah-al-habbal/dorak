"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/core/use-dictionary";
import type { OpeningHoursDay } from "@/interfaces/hours/opening-hours-day.interface";
import type { OpeningHoursPayload } from "@/interfaces/hours/opening-hours-payload.interface";
import { openingHoursKeys } from "@/lib/query-keys/hours/opening-hours-keys";
import { saveOpeningHours } from "@/services/api/mutation/hours/save-opening-hours.mutation";

export function useSaveOpeningHours(branchId: string): UseMutationResult<OpeningHoursDay[], Error, OpeningHoursPayload> {
  const { workingHours } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpeningHoursPayload) => saveOpeningHours(branchId, payload),
    onSuccess: (saved) => {
      // The response is the stored schedule; use it as the new truth instead of refetching.
      client.setQueryData(openingHoursKeys.branch(branchId), saved);
      toast.success(workingHours.toast.saved);
    },
  });
}
