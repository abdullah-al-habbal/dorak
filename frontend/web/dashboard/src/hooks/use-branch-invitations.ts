"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { branchOversightKeys } from "@/lib/query-keys/branches/branch-oversight-keys";
import { fetchBranchInvitations } from "@/services/api/query/branch-oversight.query";
import type { BranchInvitation } from "@/types/branch-invitation.type";

export function useBranchInvitations(branchId: string): UseQueryResult<BranchInvitation[]> {
  return useQuery({ queryKey: branchOversightKeys.invitations(branchId), queryFn: () => fetchBranchInvitations(branchId) });
}
