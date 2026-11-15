"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { BARBER_LOOKUP_MIN } from "@/config/invitation.constant";
import { useListQuery } from "@/hooks/use-list-query";
import { invitationKeys } from "@/lib/query-keys/branches/invitation-keys";
import { fetchBarberLookup } from "@/services/api/query/barber-lookup.query";
import type { BarberLookup } from "@/types/barber-lookup.type";

/** Idle until the term is long enough for the backend to accept it. */
export function useBarberLookup(term: string): UseQueryResult<BarberLookup[]> {
  return useListQuery(invitationKeys.lookup(term), () => fetchBarberLookup(term), term.length >= BARBER_LOOKUP_MIN);
}
