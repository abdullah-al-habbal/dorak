"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { openingHoursKeys } from "@/lib/opening-hours-keys";
import { fetchBranchOptions } from "@/services/api/query/branch-options.query";
import type { BranchOption } from "@/types/branch-option.type";

const STALE_MS = 5 * 60_000;

/** Only fetched for accounts that are not tied to one branch. */
export function useBranchOptions(enabled: boolean): UseQueryResult<BranchOption[]> {
  return useQuery({ queryKey: openingHoursKeys.branches, queryFn: fetchBranchOptions, staleTime: STALE_MS, enabled });
}
