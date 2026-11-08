export interface FeedbackMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query-key roots refreshed once the mutation settles, on success and on failure alike. */
  invalidate: ReadonlyArray<readonly unknown[]>;
  /** Toasted on success; receives the response and the variables so the copy can depend on either. */
  successMessage: (data: TData, variables: TVariables) => string;
  /** Toasted on failure. Omit it when the caller reports the failure itself (inline form errors). */
  errorMessage?: (error: Error) => string;
}
