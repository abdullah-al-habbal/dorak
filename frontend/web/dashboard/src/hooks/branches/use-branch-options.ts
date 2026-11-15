"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";
import { useReferenceQuery } from "@/hooks/core/use-reference-query";
import { openingHoursKeys } from "@/lib/query-keys/hours/opening-hours-keys";
import { fetchBranchOptions } from "@/services/api/query/branches/branch-options.query";
import type { BranchOption } from "@/types/branches/branch-option.type";

/** Only fetched for accounts that are not tied to one branch. */
export function useBranchOptions(enabled: boolean): UseQueryResult<BranchOption[]> {
  return useReferenceQuery(openingHoursKeys.branches, fetchBranchOptions, STALE_TIME.Reference, enabled);
}
