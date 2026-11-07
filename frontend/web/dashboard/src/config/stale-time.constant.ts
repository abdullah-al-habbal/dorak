const MINUTE_MS = 60_000;

/** How long reference data stays fresh before a refetch. */
export const STALE_TIME = {
  /** Option lists that change rarely (services, chairs, branches, brands, categories). */
  Reference: 5 * MINUTE_MS,
  /** Near-static lists (currencies, plan feature flags). */
  Static: 30 * MINUTE_MS,
} as const;
