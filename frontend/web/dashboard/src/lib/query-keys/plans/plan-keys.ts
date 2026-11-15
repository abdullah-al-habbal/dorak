import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const planKeys = createQueryKeys("admin-plans", {
  list: (state: string, page: number) => ["list", state, page] as const,
  options: ["options"] as const,
  featureKeys: ["feature-keys"] as const,
});
