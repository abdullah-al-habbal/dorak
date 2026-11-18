import { DASHBOARD_API } from "@/config/routes.constant";
import { FEEDBACK_PER_PAGE } from "@/config/support/feedback.constant";
import { resolvePageInfo } from "@/lib/core/query/resolve-page-info.util";
import { feedbackQueryString } from "@/lib/support/feedback-filters.util";
import { feedbackReportListSchema } from "@/schemas/support/feedback-report.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { FeedbackFilters } from "@/types/support/feedback-filters.type";
import type { FeedbackPage } from "@/types/support/feedback-page.type";

export async function fetchFeedbackPage(filters: FeedbackFilters): Promise<FeedbackPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/admin/feedback?${feedbackQueryString(filters, FEEDBACK_PER_PAGE)}`, { schema: feedbackReportListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, FEEDBACK_PER_PAGE, filters.page) };
}
