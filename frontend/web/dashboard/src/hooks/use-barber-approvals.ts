"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { barberApprovalKeys } from "@/lib/query-keys/stylists/barber-approval-keys";
import { fetchBarberApprovalPage } from "@/services/api/query/barber-approval-page.query";
import type { BarberApprovalFilters } from "@/types/barber-approval-filters.type";
import type { BarberApprovalPage } from "@/types/barber-approval-page.type";

export function useBarberApprovals(filters: BarberApprovalFilters): UseQueryResult<BarberApprovalPage> {
  return useListQuery(barberApprovalKeys.list(filters), () => fetchBarberApprovalPage(filters));
}
