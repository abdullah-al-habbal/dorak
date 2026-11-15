"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { barberApprovalKeys } from "@/lib/query-keys/stylists/barber-approval-keys";
import { fetchBarberActivationLog } from "@/services/api/query/stylists/barber-account.query";
import type { BarberActivationLog } from "@/types/stylists/barber-activation-log.type";

export function useBarberActivationLog(id: string): UseQueryResult<BarberActivationLog[]> {
  return useQuery({ queryKey: barberApprovalKeys.activationLog(id), queryFn: () => fetchBarberActivationLog(id) });
}
