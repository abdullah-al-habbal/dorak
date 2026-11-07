"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { STALE_TIME } from "@/config/stale-time.constant";

/** A long-lived option list: cached for `staleTime` and optionally gated by `enabled`. */
export function useReferenceQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  staleTime: number = STALE_TIME.Reference,
  enabled: boolean = true,
): UseQueryResult<T> {
  return useQuery({ queryKey, queryFn, staleTime, enabled });
}
