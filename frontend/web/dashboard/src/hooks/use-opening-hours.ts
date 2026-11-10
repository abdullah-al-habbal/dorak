"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useDetailQuery } from "@/hooks/use-detail-query";
import type { OpeningHoursDay } from "@/interfaces/opening-hours-day.interface";
import { openingHoursKeys } from "@/lib/opening-hours-keys";
import { fetchOpeningHours } from "@/services/api/query/opening-hours.query";

export function useOpeningHours(branchId: string | null): UseQueryResult<OpeningHoursDay[]> {
  return useDetailQuery(branchId, openingHoursKeys.branch, fetchOpeningHours);
}
