import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const languageAdminKeys = createQueryKeys("language-admin", {
  list: ["list"] as const,
});
