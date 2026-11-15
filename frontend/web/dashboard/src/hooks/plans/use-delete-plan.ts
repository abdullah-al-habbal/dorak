"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/core/query/use-delete-mutation";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { planKeys } from "@/lib/query-keys/plans/plan-keys";
import { deletePlan } from "@/services/api/mutation/plans/delete-plan.mutation";

export function useDeletePlan(): UseMutationResult<void, Error, string> {
  const { plans } = useDictionary();
  return useDeleteMutation({ remove: deletePlan, invalidate: [planKeys.all], messages: plans.toast, surfaceConflict: true });
}
