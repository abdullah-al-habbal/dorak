"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";
import { useReferenceQuery } from "@/hooks/core/query/use-reference-query";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { fetchServiceOptions } from "@/services/api/query/services/service-options.query";
import type { ServiceOption } from "@/types/services/service-option.type";

export function useServiceOptions(enabled: boolean): UseQueryResult<ServiceOption[]> {
  return useReferenceQuery(bookingKeys.services, fetchServiceOptions, STALE_TIME.Reference, enabled);
}
