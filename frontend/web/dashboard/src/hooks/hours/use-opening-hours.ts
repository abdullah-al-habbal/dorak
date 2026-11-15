"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useDetailQuery } from "@/hooks/core/use-detail-query";
import type { OpeningHoursDay } from "@/interfaces/hours/opening-hours-day.interface";
import { openingHoursKeys } from "@/lib/query-keys/hours/opening-hours-keys";
import { fetchOpeningHours } from "@/services/api/query/hours/opening-hours.query";

export function useOpeningHours(branchId: string | null): UseQueryResult<OpeningHoursDay[]> {
  return useDetailQuery(branchId, openingHoursKeys.branch, fetchOpeningHours);
}
