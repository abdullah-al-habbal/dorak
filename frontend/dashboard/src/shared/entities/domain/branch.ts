/**
 * Dashboard branch domain record. Every property is camelCase; the wire
 * contract is isolated in `branch-wire.ts`.
 */
export interface LocalizedBranchName {
  readonly ar: string;
  readonly en: string;
}

export type BranchStatus = 'disabled' | 'enabled' | 'pending';

export interface Branch {
  readonly brandId: string;
  readonly email: string;
  readonly id: string;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly name: LocalizedBranchName;
  readonly status: BranchStatus;
}
