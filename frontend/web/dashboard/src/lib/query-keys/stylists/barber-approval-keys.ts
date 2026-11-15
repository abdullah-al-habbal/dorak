import { createQueryKeys } from "@/lib/core/create-query-keys.util";
import type { BarberApprovalFilters } from "@/types/stylists/barber-approval-filters.type";

export const barberApprovalKeys = createQueryKeys("barber-approvals", {
  list: (filters: BarberApprovalFilters) => ["list", filters] as const,
  detail: (id: string) => ["detail", id] as const,
  activationLog: (id: string) => ["activation-log", id] as const,
  affiliations: (id: string) => ["affiliations", id] as const,
  pendingCount: () => ["pending-count"] as const,
});
