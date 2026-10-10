import type { BranchStatus } from './branch-status';
import type { LocalizedBranchName } from './localized-branch-name';

/**
 * Dashboard branch domain record. Every property is camelCase; the wire
 * contract is isolated in `wire/branch-wire.ts`.
 */
export interface Branch {
  readonly brandId: string;
  readonly email: string;
  readonly id: string;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly name: LocalizedBranchName;
  readonly status: BranchStatus;
}
