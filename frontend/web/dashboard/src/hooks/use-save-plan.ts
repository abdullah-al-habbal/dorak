"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import type { PlanPayload } from "@/interfaces/plan-payload.interface";
import { adminSubscriptionKeys } from "@/lib/admin-subscription-keys";
import { planKeys } from "@/lib/plan-keys";
import { createPlan, updatePlan } from "@/services/api/mutation/save-plan.mutation";
import type { Plan } from "@/types/plan.type";

interface SaveVariables {
  /** Present when editing. */
  id?: string;
  payload: PlanPayload;
}

export function useSavePlan(): UseMutationResult<Plan, Error, SaveVariables> {
  const { plans } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: SaveVariables) => (id ? updatePlan(id, payload) : createPlan(payload)),
    onSuccess: (_data, { id }) => toast.success(id ? plans.toast.updated : plans.toast.created),
    onSettled: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: planKeys.all }), client.invalidateQueries({ queryKey: adminSubscriptionKeys.all })]);
    },
  });
}
