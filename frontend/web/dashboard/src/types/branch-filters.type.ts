import type { BranchStatus } from "@/enums/branch-status.enum";

export interface BranchFilters {
  search?: string;
  brandId?: string;
  status?: BranchStatus;
  page: number;
}
