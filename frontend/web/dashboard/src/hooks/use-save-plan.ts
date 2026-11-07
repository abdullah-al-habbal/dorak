"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { PlanPayload } from "@/interfaces/plan-payload.interface";
import type { SaveVariables } from "@/interfaces/save-variables.interface";
import { adminSubscriptionKeys } from "@/lib/admin-subscription-keys";
import { planKeys } from "@/lib/plan-keys";
import { createPlan, updatePlan } from "@/services/api/mutation/save-plan.mutation";
import type { Plan } from "@/types/plan.type";

export function useSavePlan(): UseMutationResult<Plan, Error, SaveVariables<PlanPayload>> {
  const { plans } = useDictionary();
  return useSaveMutation({ create: createPlan, update: updatePlan, invalidate: [planKeys.all, adminSubscriptionKeys.all], messages: plans.toast });
}
