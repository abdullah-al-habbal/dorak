import { skipToken } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

/** Cache rules a detail read may add on top of the shared shape. */
export interface DetailQueryExtras {
  /** How long the entry stays cached after its last observer leaves; `0` drops it at once. */
  gcTime?: number;
}

/**
 * A read of one record by id, held back until the id exists. Without an id the fetcher is
 * `skipToken`, so nothing is requested and the query stays idle; with one it fetches `fetcher(id)`.
 * The key is always `keyFor(id ?? "")`, the same key the hand-written hooks used.
 */
export function detailQueryOptions<T>(
  id: string | null | undefined,
  keyFor: (id: string) => readonly unknown[],
  fetcher: (id: string) => Promise<T>,
  extras: DetailQueryExtras = {},
): UseQueryOptions<T> {
  return {
    queryKey: keyFor(id ?? ""),
    queryFn: id === null || id === undefined ? skipToken : () => fetcher(id),
    ...(extras.gcTime === undefined ? {} : { gcTime: extras.gcTime }),
  };
}
