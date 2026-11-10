import { REVIEW_MODERATION_PER_PAGE } from "@/config/review-moderation.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/resolve-page-info.util";
import { reviewModerationQueryString } from "@/lib/review-moderation-filters.util";
import { adminReviewListSchema } from "@/schemas/admin-review.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { AdminReviewPage } from "@/types/admin-review-page.type";
import type { ReviewModerationFilters } from "@/types/review-moderation-filters.type";

export async function fetchAdminReviewPage(filters: ReviewModerationFilters): Promise<AdminReviewPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/reviews?${reviewModerationQueryString(filters)}`, { schema: adminReviewListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, REVIEW_MODERATION_PER_PAGE, filters.page) };
}
