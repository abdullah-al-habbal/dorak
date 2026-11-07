"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import { branchKeys } from "@/lib/branch-keys";
import { openingHoursKeys } from "@/lib/opening-hours-keys";
import { deleteBranch } from "@/services/api/mutation/delete-branch.mutation";
import { ApiClientError } from "@/services/api/core/api-client-error";

const HTTP_CONFLICT = 409;

export function useDeleteBranch(): UseMutationResult<void, Error, string> {
  const { branches } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => toast.success(branches.toast.deleted),
    // A 409 carries the backend's reason (last branch, or upcoming bookings) in the request language.
    onError: (error) => toast.error(error instanceof ApiClientError && error.status === HTTP_CONFLICT && error.message ? error.message : branches.toast.deleteFailed),
    onSettled: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: branchKeys.all }), client.invalidateQueries({ queryKey: openingHoursKeys.branches })]);
    },
  });
}
