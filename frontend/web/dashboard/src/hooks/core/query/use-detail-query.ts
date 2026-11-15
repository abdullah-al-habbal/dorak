"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { detailQueryOptions } from "@/lib/core/query/detail-query.util";
import type { DetailQueryExtras } from "@/lib/core/query/detail-query.util";

/** One record read by id; idle (`skipToken`) while `id` is `null` or `undefined`. `extras.gcTime` sets how long a closed read stays cached. */
export function useDetailQuery<T>(
  id: string | null | undefined,
  keyFor: (id: string) => readonly unknown[],
  fetcher: (id: string) => Promise<T>,
  extras?: DetailQueryExtras,
): UseQueryResult<T> {
  return useQuery(detailQueryOptions(id, keyFor, fetcher, extras));
}
