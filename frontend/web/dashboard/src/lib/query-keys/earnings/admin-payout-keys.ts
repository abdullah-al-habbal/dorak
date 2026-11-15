import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const adminPayoutKeys = createQueryKeys("admin-payouts", {
  list: (status: string, page: number) => ["list", status, page] as const,
  detail: (id: string) => ["detail", id] as const,
  entries: (id: string, page: number) => ["entries", id, page] as const,
});
