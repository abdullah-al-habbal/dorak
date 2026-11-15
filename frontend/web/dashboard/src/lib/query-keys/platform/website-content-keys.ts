import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const websiteContentKeys = createQueryKeys("website-content", {
  content: ["content"] as const,
  onboarding: ["onboarding"] as const,
});
