import type { Branch } from "@/types/branch.type";
import type { PageInfo } from "@/types/page-info.type";

export interface BranchPage {
  items: Branch[];
  page: PageInfo;
}
