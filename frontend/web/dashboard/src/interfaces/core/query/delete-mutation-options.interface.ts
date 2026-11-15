export interface DeleteMutationOptions {
  remove: (id: string) => Promise<void>;
  /** Query-key roots refreshed once the delete settles. */
  invalidate: ReadonlyArray<readonly unknown[]>;
  messages: { deleted: string; deleteFailed: string };
  /** Show the backend's 409 reason instead of the generic failure copy. */
  surfaceConflict?: boolean;
}
