import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const currencyAdminKeys = createQueryKeys("currency-admin", {
  currencies: ["currencies"] as const,
  rates: ["rates"] as const,
});
