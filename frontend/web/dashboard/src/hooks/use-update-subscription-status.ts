"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { adminSubscriptionKeys } from "@/lib/admin-subscription-keys";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { updateSubscriptionStatus } from "@/services/api/mutation/update-subscription-status.mutation";
import type { UpdateSubscriptionStatusVariables } from "@/services/api/mutation/update-subscription-status.mutation";
import type { AdminSubscription } from "@/types/admin-subscription.type";

const HTTP_CONFLICT = 409;

export function useUpdateSubscriptionStatus(): UseMutationResult<AdminSubscription, Error, UpdateSubscriptionStatusVariables> {
  const { adminSubscriptions } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateSubscriptionStatus,
    onSuccess: () => toast.success(adminSubscriptions.toast.updated),
    // A 409 means the status already moved; the backend's message says why.
    onError: (error) => toast.error(error instanceof ApiClientError && error.status === HTTP_CONFLICT && error.message ? error.message : adminSubscriptions.toast.updateFailed),
    onSettled: () => client.invalidateQueries({ queryKey: adminSubscriptionKeys.all }),
  });
}
