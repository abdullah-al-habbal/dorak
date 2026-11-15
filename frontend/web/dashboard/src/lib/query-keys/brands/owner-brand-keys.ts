import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const ownerBrandKeys = createQueryKeys("owner-brands", {
  mine: ["mine"] as const,
});
