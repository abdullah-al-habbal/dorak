import { QueryClient } from "@tanstack/react-query";

import { HttpStatus } from "@/enums/http-status.enum";
import { ApiClientError } from "@/services/api/core/api-client-error";

const STALE_TIME_MS = 30_000;
const MAX_RETRIES = 2;

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiClientError && [HttpStatus.Unauthorized, HttpStatus.Forbidden].includes(error.status)) return false;
  return failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME_MS, refetchOnWindowFocus: false, retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}
