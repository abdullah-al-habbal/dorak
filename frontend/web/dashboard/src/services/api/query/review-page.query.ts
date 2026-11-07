import { REVIEW_PER_PAGE } from "@/config/review.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/resolve-page-info.util";
import { reviewListSchema, reviewSummarySchema } from "@/schemas/review.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { ReviewPage } from "@/types/review-page.type";

const EMPTY_SUMMARY = { average: null, count: 0, distribution: {} };

export async function fetchReviewPage(branchId: string, page: number): Promise<ReviewPage> {
  const path = `${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/reviews?per_page=${REVIEW_PER_PAGE}&page=${page}`;
  const { data, meta } = await apiRequestWithMeta(path, { schema: reviewListSchema });
  const body = (meta ?? {}) as { summary?: unknown };
  const summary = reviewSummarySchema.safeParse(body.summary);
  return { items: data, page: resolvePageInfo(meta, data.length, REVIEW_PER_PAGE, page), summary: summary.success ? summary.data : EMPTY_SUMMARY };
}
