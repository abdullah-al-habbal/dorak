"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";
import { useReferenceQuery } from "@/hooks/core/use-reference-query";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { fetchChairs } from "@/services/api/query/chairs.query";
import type { ChairOption } from "@/types/chairs/chair-option.type";

export function useChairOptions(): UseQueryResult<ChairOption[]> {
  return useReferenceQuery(bookingKeys.chairs, fetchChairs, STALE_TIME.Reference);
}
