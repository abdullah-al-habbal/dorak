import { createQueryKeys } from "@/lib/create-query-keys.util";

export const adminPayoutKeys = createQueryKeys("admin-payouts", {
  list: (status: string, page: number) => ["list", status, page] as const,
});
