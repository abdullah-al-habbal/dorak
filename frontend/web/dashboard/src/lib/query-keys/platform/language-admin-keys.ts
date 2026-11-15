import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const languageAdminKeys = createQueryKeys("language-admin", {
  list: ["list"] as const,
});
