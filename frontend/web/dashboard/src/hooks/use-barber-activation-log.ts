"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { barberApprovalKeys } from "@/lib/barber-approval-keys";
import { fetchBarberActivationLog } from "@/services/api/query/barber-account.query";
import type { BarberActivationLog } from "@/types/barber-activation-log.type";

export function useBarberActivationLog(id: string): UseQueryResult<BarberActivationLog[]> {
  return useQuery({ queryKey: barberApprovalKeys.activationLog(id), queryFn: () => fetchBarberActivationLog(id) });
}
