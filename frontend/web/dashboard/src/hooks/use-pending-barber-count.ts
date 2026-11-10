"use client";

import { useQuery } from "@tanstack/react-query";

import { BarberStatus } from "@/enums/barber-status.enum";
import { barberApprovalKeys } from "@/lib/barber-approval-keys";
import { fetchBarberApprovalPage } from "@/services/api/query/barber-approval-page.query";

const PENDING_COUNT_PAGE_SIZE = 1;
const PENDING_COUNT_STALE_MS = 60_000;

/** The size of the barber review queue, for the sidebar badge. Only admins call it. */
export function usePendingBarberCount(): number {
  const { data } = useQuery({
    queryKey: barberApprovalKeys.pendingCount(),
    queryFn: () => fetchBarberApprovalPage({ status: BarberStatus.Pending, page: 1 }, PENDING_COUNT_PAGE_SIZE),
    staleTime: PENDING_COUNT_STALE_MS,
    select: (page) => page.page.total,
  });
  return data ?? 0;
}
