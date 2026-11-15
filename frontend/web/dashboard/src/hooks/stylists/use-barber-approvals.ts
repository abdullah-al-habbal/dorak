"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/use-list-query";
import { barberApprovalKeys } from "@/lib/query-keys/stylists/barber-approval-keys";
import { fetchBarberApprovalPage } from "@/services/api/query/stylists/barber-approval-page.query";
import type { BarberApprovalFilters } from "@/types/stylists/barber-approval-filters.type";
import type { BarberApprovalPage } from "@/types/stylists/barber-approval-page.type";

export function useBarberApprovals(filters: BarberApprovalFilters): UseQueryResult<BarberApprovalPage> {
  return useListQuery(barberApprovalKeys.list(filters), () => fetchBarberApprovalPage(filters));
}
