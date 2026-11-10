import { createQueryKeys } from "@/lib/create-query-keys.util";

export const ownerBrandKeys = createQueryKeys("owner-brands", {
  mine: ["mine"] as const,
});
