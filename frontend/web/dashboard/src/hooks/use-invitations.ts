"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { invitationKeys } from "@/lib/query-keys/branches/invitation-keys";
import { fetchInvitationPage } from "@/services/api/query/invitation-page.query";
import type { InvitationPage } from "@/types/invitation-page.type";

export function useInvitations(branchId: string, status: string, page: number): UseQueryResult<InvitationPage> {
  return useListQuery(invitationKeys.list(branchId, status, page), () => fetchInvitationPage(branchId, status, page));
}
