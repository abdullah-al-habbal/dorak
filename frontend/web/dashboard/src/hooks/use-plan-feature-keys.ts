"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { planKeys } from "@/lib/plan-keys";
import { fetchPlanFeatureKeys } from "@/services/api/query/plan-feature-keys.query";

const STALE_MS = 30 * 60_000;

/** The flags a plan may unlock; the backend's `BrandFeatures` is the single source. */
export function usePlanFeatureKeys(): UseQueryResult<string[]> {
  return useQuery({ queryKey: planKeys.featureKeys, queryFn: fetchPlanFeatureKeys, staleTime: STALE_MS });
}
