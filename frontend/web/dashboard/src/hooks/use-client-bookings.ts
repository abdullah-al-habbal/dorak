"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { ClientRelation } from "@/enums/client-relation.enum";
import { clientKeys } from "@/lib/client-keys";
import { fetchClientBookings } from "@/services/api/query/client.query";
import type { ClientBooking } from "@/types/client-booking.type";

export function useClientBookings(id: string): UseQueryResult<ClientBooking[]> {
  return useQuery({ queryKey: clientKeys.relation(id, ClientRelation.Bookings), queryFn: () => fetchClientBookings(id) });
}
