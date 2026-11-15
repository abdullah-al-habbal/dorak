import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const brandHistoryKeys = createQueryKeys("brand-history", {
  subject: (type: string, id: string) => [type, id] as const,
});
