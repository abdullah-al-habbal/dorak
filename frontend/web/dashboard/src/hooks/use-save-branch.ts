"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDictionary } from "@/hooks/use-dictionary";
import type { BranchPayload } from "@/interfaces/branch-payload.interface";
import { branchKeys } from "@/lib/branch-keys";
import { openingHoursKeys } from "@/lib/opening-hours-keys";
import { createBranch, updateBranch } from "@/services/api/mutation/save-branch.mutation";
import type { BranchDetail } from "@/types/branch-detail.type";

interface SaveVariables {
  /** Present when editing. */
  id?: string;
  payload: BranchPayload;
}

export function useSaveBranch(): UseMutationResult<BranchDetail, Error, SaveVariables> {
  const { branches } = useDictionary();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: SaveVariables) => (id ? updateBranch(id, payload) : createBranch(payload)),
    onSuccess: (_data, { id }) => toast.success(id ? branches.toast.updated : branches.toast.created),
    onSettled: async () => {
      // Branch pickers elsewhere (chairs, reviews, working hours) read the same list.
      await Promise.all([client.invalidateQueries({ queryKey: branchKeys.all }), client.invalidateQueries({ queryKey: openingHoursKeys.branches })]);
    },
  });
}
