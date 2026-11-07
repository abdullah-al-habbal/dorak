"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { branchKeys } from "@/lib/branch-keys";
import { fetchBrandOptions } from "@/services/api/query/brand-options.query";
import type { BrandOption } from "@/types/brand-option.type";

const STALE_MS = 5 * 60_000;

export function useBrandOptions(): UseQueryResult<BrandOption[]> {
  return useQuery({ queryKey: branchKeys.brands, queryFn: fetchBrandOptions, staleTime: STALE_MS });
}
