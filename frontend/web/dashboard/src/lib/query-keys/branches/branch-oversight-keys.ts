import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const branchOversightKeys = createQueryKeys("branch-oversight", {
  invitations: (branchId: string) => ["invitations", branchId] as const,
  jobPostings: (branchId: string) => ["job-postings", branchId] as const,
});
