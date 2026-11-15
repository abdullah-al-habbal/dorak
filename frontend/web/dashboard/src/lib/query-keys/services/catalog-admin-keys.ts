import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const catalogAdminKeys = createQueryKeys("catalog-admin", {
  items: (categoryId: string, search: string, page: number) => ["items", categoryId, search, page] as const,
  tags: ["tags"] as const,
});
