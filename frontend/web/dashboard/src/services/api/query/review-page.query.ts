import { REVIEW_PER_PAGE } from "@/config/review.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { pageInfoSchema } from "@/schemas/page-info.zod";
import { reviewListSchema, reviewSummarySchema } from "@/schemas/review.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { ReviewPage } from "@/types/review-page.type";

const EMPTY_SUMMARY = { average: null, count: 0, distribution: {} };

export async function fetchReviewPage(branchId: string, page: number): Promise<ReviewPage> {
  const path = `${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/reviews?per_page=${REVIEW_PER_PAGE}&page=${page}`;
  const { data, meta } = await apiRequestWithMeta(path, { schema: reviewListSchema });
  const body = (meta ?? {}) as { pagination?: unknown; summary?: unknown };
  const pagination = pageInfoSchema.safeParse(body.pagination);
  const summary = reviewSummarySchema.safeParse(body.summary);
  const fallback = { total: data.length, per_page: REVIEW_PER_PAGE, current_page: page, total_pages: 1 };
  return { items: data, page: pagination.success ? pagination.data : fallback, summary: summary.success ? summary.data : EMPTY_SUMMARY };
}
