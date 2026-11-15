export interface OptimisticToggleMutationOptions<TData, TVariables, TCache> {
  /** Query-key root whose cached entries are patched, rolled back on failure, and refreshed once settled. */
  queryKey: readonly unknown[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Returns one cached entry with the toggle applied; entries without the record are returned as-is. */
  patch: (cached: TCache | undefined, variables: TVariables) => TCache | undefined;
  successMessage: (variables: TVariables) => string;
  /** Toasted after the rollback. Omit it when the caller reports the failure itself. */
  failureMessage?: string;
  /** Other query-key roots refreshed once settled, such as an option list the toggle changes. Not patched optimistically. */
  invalidate?: ReadonlyArray<readonly unknown[]>;
}
