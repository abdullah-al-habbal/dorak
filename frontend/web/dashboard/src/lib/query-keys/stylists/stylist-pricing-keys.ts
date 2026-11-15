import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const stylistPricingKeys = createQueryKeys("stylist-pricing", {
  terms: (barberId: string, brandId: string) => ["terms", barberId, brandId] as const,
});
