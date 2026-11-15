export interface SaveMutationOptions<P, R> {
  create: (payload: P) => Promise<R>;
  update: (id: string, payload: P) => Promise<R>;
  /** Query-key roots refreshed once the save settles. */
  invalidate: ReadonlyArray<readonly unknown[]>;
  messages: { created: string; updated: string };
}
