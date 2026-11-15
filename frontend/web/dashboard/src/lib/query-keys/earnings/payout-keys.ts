import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const payoutKeys = createQueryKeys("payouts", {
  list: (status: string, page: number) => ["list", status, page] as const,
});
