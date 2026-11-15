import { createQueryKeys } from "@/lib/core/create-query-keys.util";
import type { ReviewModerationFilters } from "@/types/clients/review-moderation-filters.type";

export const reviewModerationKeys = createQueryKeys("review-moderation", {
  list: (filters: ReviewModerationFilters) => ["list", filters] as const,
});
