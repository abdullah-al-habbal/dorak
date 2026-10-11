import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
  isAuthorizationError,
  isRetryableApiError,
} from "@/services/api/client-error.util";
import type { Dictionary } from "@/i18n/dictionary.types";
import { notifyApiError } from "@/services/api/notifications";

/**
 * `getDictionary` is read at failure time so toasts follow locale switches
 * without recreating the client (and dropping its cache). Failures are reported
 * from the caches, so a per-mutation `onError` cannot silence them.
 */
export function createQueryClient(getDictionary?: () => Dictionary) {
  const reportError = (error: unknown) => {
    const dictionary = getDictionary?.();
    if (dictionary) notifyApiError(error, dictionary);
  };

  return new QueryClient({
    queryCache: new QueryCache({ onError: reportError }),
    mutationCache: new MutationCache({ onError: reportError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          !isAuthorizationError(error) &&
          isRetryableApiError(error) &&
          failureCount < 2,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
