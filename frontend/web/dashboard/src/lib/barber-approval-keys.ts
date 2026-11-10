import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { BarberApprovalFilters } from "@/types/barber-approval-filters.type";

export const barberApprovalKeys = createQueryKeys("barber-approvals", {
  list: (filters: BarberApprovalFilters) => ["list", filters] as const,
  detail: (id: string) => ["detail", id] as const,
  pendingCount: () => ["pending-count"] as const,
});
