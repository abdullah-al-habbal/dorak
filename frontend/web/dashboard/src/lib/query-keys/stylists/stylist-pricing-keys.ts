import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const stylistPricingKeys = createQueryKeys("stylist-pricing", {
  terms: (barberId: string, brandId: string) => ["terms", barberId, brandId] as const,
});
