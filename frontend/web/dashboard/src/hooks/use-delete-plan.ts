"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { planKeys } from "@/lib/plan-keys";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { deletePlan } from "@/services/api/mutation/delete-plan.mutation";

const HTTP_CONFLICT = 409;

export function useDeletePlan(): UseMutationResult<void, Error, string> {
  const { plans } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: deletePlan,
    onSuccess: () => toast.success(plans.toast.deleted),
    // A 409 carries the backend's reason (the plan still has live subscriptions) in the request language.
    onError: (error) => toast.error(error instanceof ApiClientError && error.status === HTTP_CONFLICT && error.message ? error.message : plans.toast.deleteFailed),
    onSettled: () => client.invalidateQueries({ queryKey: planKeys.all }),
  });
}
