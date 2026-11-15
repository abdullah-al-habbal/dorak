"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { branchKeys } from "@/lib/query-keys/branches/branch-keys";
import { openingHoursKeys } from "@/lib/query-keys/hours/opening-hours-keys";
import { deleteBranch } from "@/services/api/mutation/delete-branch.mutation";

export function useDeleteBranch(): UseMutationResult<void, Error, string> {
  const { branches } = useDictionary();
  return useDeleteMutation({ remove: deleteBranch, invalidate: [branchKeys.all, openingHoursKeys.branches], messages: branches.toast, surfaceConflict: true });
}
