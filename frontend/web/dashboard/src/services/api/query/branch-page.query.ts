import { BRANCH_PER_PAGE } from "@/config/branch.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { branchQueryString } from "@/lib/branch-filters.util";
import { branchListSchema } from "@/schemas/branch.zod";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { BranchFilters } from "@/types/branch-filters.type";
import type { BranchPage } from "@/types/branch-page.type";

export async function fetchBranchPage(filters: BranchFilters): Promise<BranchPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/branches?${branchQueryString(filters, BRANCH_PER_PAGE)}`, { schema: branchListSchema });
  const pagination = pageInfoSchema.safeParse((meta as { pagination?: unknown } | null)?.pagination);
  const fallback = { total: data.length, per_page: BRANCH_PER_PAGE, current_page: filters.page, total_pages: 1 };
  return { items: data, page: pagination.success ? pagination.data : fallback };
}
