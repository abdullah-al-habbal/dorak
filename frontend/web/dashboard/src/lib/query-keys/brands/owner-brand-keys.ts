import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const ownerBrandKeys = createQueryKeys("owner-brands", {
  mine: ["mine"] as const,
});
