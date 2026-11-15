import type { BranchStatus } from "@/enums/venue/branch-status.enum";

export interface BranchFilters {
  search?: string;
  brandId?: string;
  status?: BranchStatus;
  page: number;
}
