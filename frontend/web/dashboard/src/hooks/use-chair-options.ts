"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { bookingKeys } from "@/lib/booking-keys";
import { fetchChairs } from "@/services/api/query/chairs.query";
import type { ChairOption } from "@/types/chair-option.type";

const STALE_MS = 5 * 60_000;

export function useChairOptions(): UseQueryResult<ChairOption[]> {
  return useQuery({ queryKey: bookingKeys.chairs, queryFn: fetchChairs, staleTime: STALE_MS });
}
