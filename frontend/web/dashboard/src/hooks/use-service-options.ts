"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";
import { useReferenceQuery } from "@/hooks/use-reference-query";
import { bookingKeys } from "@/lib/booking-keys";
import { fetchServiceOptions } from "@/services/api/query/service-options.query";
import type { ServiceOption } from "@/types/service-option.type";

export function useServiceOptions(enabled: boolean): UseQueryResult<ServiceOption[]> {
  return useReferenceQuery(bookingKeys.services, fetchServiceOptions, STALE_TIME.Reference, enabled);
}
