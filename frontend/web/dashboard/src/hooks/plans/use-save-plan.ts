"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useSaveMutation } from "@/hooks/core/use-save-mutation";
import type { PlanPayload } from "@/interfaces/plans/plan-payload.interface";
import type { SaveVariables } from "@/interfaces/core/save-variables.interface";
import { adminSubscriptionKeys } from "@/lib/query-keys/plans/admin-subscription-keys";
import { planKeys } from "@/lib/query-keys/plans/plan-keys";
import { createPlan, updatePlan } from "@/services/api/mutation/plans/save-plan.mutation";
import type { Plan } from "@/types/plans/plan.type";

export function useSavePlan(): UseMutationResult<Plan, Error, SaveVariables<PlanPayload>> {
  const { plans } = useDictionary();
  return useSaveMutation({ create: createPlan, update: updatePlan, invalidate: [planKeys.all, adminSubscriptionKeys.all], messages: plans.toast });
}
