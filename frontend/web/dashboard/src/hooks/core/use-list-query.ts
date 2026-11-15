"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { listQueryOptions } from "@/lib/core/list-query.util";

/** A paged or filtered list that keeps the previous result on screen while the next one loads; optionally gated by `enabled`. */
export function useListQuery<T>(queryKey: readonly unknown[], queryFn: () => Promise<T>, enabled: boolean = true): UseQueryResult<T> {
  return useQuery(listQueryOptions(queryKey, queryFn, enabled));
}
