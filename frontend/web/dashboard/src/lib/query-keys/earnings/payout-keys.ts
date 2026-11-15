import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const payoutKeys = createQueryKeys("payouts", {
  list: (status: string, page: number) => ["list", status, page] as const,
});
