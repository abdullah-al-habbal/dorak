import { createQueryKeys } from "@/lib/create-query-keys.util";

export const websiteContentKeys = createQueryKeys("website-content", {
  content: ["content"] as const,
  onboarding: ["onboarding"] as const,
});
