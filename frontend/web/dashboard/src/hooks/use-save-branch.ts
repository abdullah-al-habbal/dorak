"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { BranchPayload } from "@/interfaces/branch-payload.interface";
import type { SaveVariables } from "@/interfaces/save-variables.interface";
import { branchKeys } from "@/lib/query-keys/branches/branch-keys";
import { openingHoursKeys } from "@/lib/query-keys/hours/opening-hours-keys";
import { createBranch, updateBranch } from "@/services/api/mutation/save-branch.mutation";
import type { BranchDetail } from "@/types/branch-detail.type";

export function useSaveBranch(): UseMutationResult<BranchDetail, Error, SaveVariables<BranchPayload>> {
  const { branches } = useDictionary();
  return useSaveMutation({ create: createBranch, update: updateBranch, invalidate: [branchKeys.all, openingHoursKeys.branches], messages: branches.toast });
}
