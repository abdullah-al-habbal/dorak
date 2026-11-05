"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import type { OpeningHoursDay } from "@/interfaces/opening-hours-day.interface";
import { openingHoursKeys } from "@/lib/opening-hours-keys";
import { fetchOpeningHours } from "@/services/api/query/opening-hours.query";

export function useOpeningHours(branchId: string | null): UseQueryResult<OpeningHoursDay[]> {
  return useQuery({
    queryKey: openingHoursKeys.branch(branchId ?? ""),
    queryFn: () => fetchOpeningHours(branchId ?? ""),
    enabled: branchId !== null,
  });
}
