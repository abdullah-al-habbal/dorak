import type { BranchStatus } from '../types/branch-status';
import type { LocalizedBranchName } from '../types/localized-branch-name';

export interface BranchFormInput {
  readonly brandId: string;
  readonly email: string;
  readonly latitude: number | undefined;
  readonly longitude: number | undefined;
  readonly name: LocalizedBranchName;
  readonly password: string | undefined;
  readonly status: BranchStatus | undefined;
}
