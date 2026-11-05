"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { bookingKeys } from "@/lib/booking-keys";
import { fetchServiceOptions } from "@/services/api/query/service-options.query";
import type { ServiceOption } from "@/types/service-option.type";

const STALE_MS = 5 * 60_000;

export function useServiceOptions(enabled: boolean): UseQueryResult<ServiceOption[]> {
  return useQuery({ queryKey: bookingKeys.services, queryFn: fetchServiceOptions, staleTime: STALE_MS, enabled });
}
