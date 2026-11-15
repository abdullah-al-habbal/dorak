"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";
import { useReferenceQuery } from "@/hooks/use-reference-query";
import { planKeys } from "@/lib/query-keys/plans/plan-keys";
import { fetchPlanFeatureKeys } from "@/services/api/query/plan-feature-keys.query";

/** The flags a plan may unlock; the backend's `BrandFeatures` is the single source. */
export function usePlanFeatureKeys(): UseQueryResult<string[]> {
  return useReferenceQuery(planKeys.featureKeys, fetchPlanFeatureKeys, STALE_TIME.Static);
}
