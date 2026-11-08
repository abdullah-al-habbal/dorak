/** Every cached entry under the toggled root as it was before the optimistic patch, used for rollback. */
export interface OptimisticToggleContext<TCache> {
  snapshots: [readonly unknown[], TCache | undefined][];
}
