import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";
import type { FeedbackFilters } from "@/types/support/feedback-filters.type";

export const feedbackKeys = createQueryKeys("admin-feedback", {
  list: (filters: FeedbackFilters) => ["list", filters] as const,
});
