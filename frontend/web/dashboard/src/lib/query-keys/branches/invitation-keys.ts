import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const invitationKeys = createQueryKeys("invitations", {
  list: (branchId: string, status: string, page: number) => ["list", branchId, status, page] as const,
  lookup: (term: string) => ["lookup", term] as const,
});
