"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";
import { useReferenceQuery } from "@/hooks/use-reference-query";
import { branchKeys } from "@/lib/branch-keys";
import { fetchBrandOptions } from "@/services/api/query/brand-options.query";
import type { BrandOption } from "@/types/brand-option.type";

export function useBrandOptions(): UseQueryResult<BrandOption[]> {
  return useReferenceQuery(branchKeys.brands, fetchBrandOptions, STALE_TIME.Reference);
}
