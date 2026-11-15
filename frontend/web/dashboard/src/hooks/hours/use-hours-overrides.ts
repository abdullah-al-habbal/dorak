"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useDetailQuery } from "@/hooks/core/use-detail-query";
import { hoursOverrideKeys } from "@/lib/query-keys/hours/hours-override-keys";
import { fetchHoursOverrides } from "@/services/api/query/hours/hours-override.query";
import type { HoursOverride } from "@/types/hours/hours-override.type";

export function useHoursOverrides(branchId: string | null): UseQueryResult<HoursOverride[]> {
  return useDetailQuery(branchId, hoursOverrideKeys.branch, fetchHoursOverrides);
}
