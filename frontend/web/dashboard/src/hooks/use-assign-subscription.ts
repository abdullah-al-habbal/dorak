"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { adminSubscriptionKeys } from "@/lib/admin-subscription-keys";
import { assignSubscription } from "@/services/api/mutation/assign-subscription.mutation";
import type { AssignSubscriptionVariables } from "@/services/api/mutation/assign-subscription.mutation";
import type { AdminSubscription } from "@/types/admin-subscription.type";

/** Failures are rethrown to the dialog, which shows the backend's reason inline. */
export function useAssignSubscription(): UseMutationResult<AdminSubscription, Error, AssignSubscriptionVariables> {
  const { adminSubscriptions } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: assignSubscription,
    onSuccess: () => toast.success(adminSubscriptions.toast.assigned),
    onSettled: () => client.invalidateQueries({ queryKey: adminSubscriptionKeys.all }),
  });
}
