import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { ReviewModerationFilters } from "@/types/review-moderation-filters.type";

export const reviewModerationKeys = createQueryKeys("review-moderation", {
  list: (filters: ReviewModerationFilters) => ["list", filters] as const,
});
