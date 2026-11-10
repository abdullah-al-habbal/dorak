"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { barberApprovalKeys } from "@/lib/barber-approval-keys";
import { fetchBarberApproval } from "@/services/api/query/barber-approval.query";
import type { BarberApproval } from "@/types/barber-approval.type";

/** The detail dialog's read (it adds the portfolio). It starts from the list row, so the dialog never opens empty. */
export function useBarberApproval(barber: BarberApproval): UseQueryResult<BarberApproval> {
  return useQuery({ queryKey: barberApprovalKeys.detail(barber.id), queryFn: () => fetchBarberApproval(barber.id), placeholderData: barber });
}
