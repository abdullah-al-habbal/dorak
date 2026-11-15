import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const floorPlanKeys = createQueryKeys("floor-plan", {
  branch: (branchId: string) => [branchId] as const,
});
