import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const websiteContentKeys = createQueryKeys("website-content", {
  content: ["content"] as const,
  onboarding: ["onboarding"] as const,
});
