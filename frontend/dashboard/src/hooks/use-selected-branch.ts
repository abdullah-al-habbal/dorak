"use client";

import { useDashboardListOptions } from "@/hooks/use-dashboard-list-options";
import { mapBranch } from "@/services/api/dashboard/shared/dashboard-mapper.util";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SELECTED_BRANCH_QUERY_PARAM = "branch";
const SELECTED_BRANCH_OPTIONS_PAGE_SIZE = 100;

/**
 * Branch scope for per-branch pages. The choice lives in the URL
 * (`?branch=`), defaulting to the first branch the actor can access.
 */
export function useSelectedBranch(keySuffix: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const branches = useDashboardListOptions("branches", mapBranch, {
    page: 1,
    perPage: SELECTED_BRANCH_OPTIONS_PAGE_SIZE,
    keySuffix,
  });
  const options = branches.data ?? [];
  const requested = searchParams.get(SELECTED_BRANCH_QUERY_PARAM);
  const branchId =
    options.find((branch) => branch.id === requested)?.id ?? options[0]?.id;

  const selectBranch = (id: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set(SELECTED_BRANCH_QUERY_PARAM, id);
    router.replace(`${pathname}?${next.toString()}`);
  };

  return {
    branches: options,
    branchId,
    isLoading: branches.isPending,
    selectBranch,
  };
}
