import { queryKey } from "@/lib/core/query/create-query-keys.util";

export const openingHoursKeys = {
  branch: (branchId: string) => queryKey("opening-hours", branchId),
  // Branch options feed the picker only; a schedule save must not refetch them.
  branches: queryKey("branch-options"),
};
