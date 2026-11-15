import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const accountKeys = createQueryKeys("account", {
  profile: ["profile"],
  notifications: ["notifications"],
  settings: ["settings"],
});
