import { createQueryKeys } from "@/lib/create-query-keys.util";

export const hoursOverrideKeys = createQueryKeys("hours-overrides", {
  branch: (branchId: string) => [branchId] as const,
});
