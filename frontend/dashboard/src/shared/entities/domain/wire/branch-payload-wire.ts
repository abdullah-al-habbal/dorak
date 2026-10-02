import type { BranchStatus } from '../types/branch-status';
import type { LocalizedBranchName } from '../types/localized-branch-name';

export type BranchPayloadWire = {
  readonly brand_id: string;
  readonly email: string;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly name: LocalizedBranchName;
  readonly password?: string;
  readonly status?: BranchStatus;
};
