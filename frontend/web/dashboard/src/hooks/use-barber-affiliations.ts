"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { barberApprovalKeys } from "@/lib/query-keys/stylists/barber-approval-keys";
import { fetchBarberAffiliations } from "@/services/api/query/barber-account.query";
import type { BarberAffiliation } from "@/types/barber-affiliation.type";

export function useBarberAffiliations(id: string): UseQueryResult<BarberAffiliation[]> {
  return useQuery({ queryKey: barberApprovalKeys.affiliations(id), queryFn: () => fetchBarberAffiliations(id) });
}
