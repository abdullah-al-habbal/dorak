import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const jobKeys = createQueryKeys("jobs", {
  postings: (branchId: string, page: number) => ["postings", branchId, page] as const,
  applications: (branchId: string, postingId: string, page: number) => ["applications", branchId, postingId, page] as const,
});
