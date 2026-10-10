import type { BranchStatus } from '../types/branch-status';
import type { LocalizedBranchName } from '../types/localized-branch-name';

/**
 * Backend `BranchResource` contract. Snake case may exist only in a wire
 * translation module.
 */
export interface BranchWire {
  readonly brand_id: string;
  readonly compatibility_score: number | null;
  readonly created_at: string | null;
  readonly distance: number | null;
  readonly email: string;
  readonly id: string;
  readonly latitude: number | string | null;
  readonly longitude: number | string | null;
  readonly name: LocalizedBranchName;
  readonly rank: number | null;
  readonly status: BranchStatus;
}
