import { createQueryKeys } from "@/lib/create-query-keys.util";

export const languageAdminKeys = createQueryKeys("language-admin", {
  list: ["list"] as const,
});
