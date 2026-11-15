import type { Branch } from "@/types/branches/branch.type";
import type { PageInfo } from "@/types/core/page-info.type";

export interface BranchPage {
  items: Branch[];
  page: PageInfo;
}
