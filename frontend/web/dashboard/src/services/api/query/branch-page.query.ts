import { BRANCH_PER_PAGE } from "@/config/branch.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { branchQueryString } from "@/lib/branch-filters.util";
import { resolvePageInfo } from "@/lib/resolve-page-info.util";
import { branchListSchema } from "@/schemas/branch.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { BranchFilters } from "@/types/branches/branch-filters.type";
import type { BranchPage } from "@/types/branches/branch-page.type";

export async function fetchBranchPage(filters: BranchFilters): Promise<BranchPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/branches?${branchQueryString(filters, BRANCH_PER_PAGE)}`, { schema: branchListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, BRANCH_PER_PAGE, filters.page) };
}
