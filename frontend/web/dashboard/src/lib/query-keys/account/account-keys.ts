import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const accountKeys = createQueryKeys("account", {
  profile: ["profile"],
  notifications: ["notifications"],
  settings: ["settings"],
});
