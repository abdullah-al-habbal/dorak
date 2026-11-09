"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";
import type { BrandStatus } from "@/enums/brand-status.enum";
import { useReferenceQuery } from "@/hooks/use-reference-query";
import { branchKeys } from "@/lib/branch-keys";
import { fetchBrandOptions } from "@/services/api/query/brand-options.query";
import type { BrandOption } from "@/types/brand-option.type";

/** Brand options for pickers. Pass `BrandStatus.Active` where a pending brand must not be offered. */
export function useBrandOptions(status?: BrandStatus): UseQueryResult<BrandOption[]> {
  const key = status ? branchKeys.brandsByStatus(status) : branchKeys.brands;
  return useReferenceQuery(key, () => fetchBrandOptions(status), STALE_TIME.Reference);
}
