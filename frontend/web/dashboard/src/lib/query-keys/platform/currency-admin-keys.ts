import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const currencyAdminKeys = createQueryKeys("currency-admin", {
  currencies: ["currencies"] as const,
  rates: ["rates"] as const,
});
