"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useSaveMutation } from "@/hooks/core/query/use-save-mutation";
import type { BranchPayload } from "@/interfaces/branches/branch-payload.interface";
import type { SaveVariables } from "@/interfaces/core/query/save-variables.interface";
import { branchKeys } from "@/lib/query-keys/branches/branch-keys";
import { openingHoursKeys } from "@/lib/query-keys/hours/opening-hours-keys";
import { createBranch, updateBranch } from "@/services/api/mutation/branches/save-branch.mutation";
import type { BranchDetail } from "@/types/branches/branch-detail.type";

export function useSaveBranch(): UseMutationResult<BranchDetail, Error, SaveVariables<BranchPayload>> {
  const { branches } = useDictionary();
  return useSaveMutation({ create: createBranch, update: updateBranch, invalidate: [branchKeys.all, openingHoursKeys.branches], messages: branches.toast });
}
