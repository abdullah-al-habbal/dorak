import { keepPreviousData } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

/** A paged or filtered list: the previous result stays on screen while the next key loads. */
export function listQueryOptions<T>(queryKey: readonly unknown[], queryFn: () => Promise<T>, enabled: boolean = true): UseQueryOptions<T> {
  return { queryKey, queryFn, enabled, placeholderData: keepPreviousData };
}
