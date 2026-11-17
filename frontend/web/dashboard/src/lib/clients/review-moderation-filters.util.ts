import { DEFAULT_REVIEW_MODERATION_STATUS, REVIEW_MODERATION_PER_PAGE } from "@/config/platform/review-moderation.constant";
import { ReviewStatus } from "@/enums/people/review-status.enum";
import { isEnumValue } from "@/lib/core/parse/enum-value.util";
import type { ReviewModerationFilters } from "@/types/clients/reviews/review-moderation-filters.type";


function isStatus(value: string): value is ReviewStatus {
  return isEnumValue(ReviewStatus, value);
}

/** A bare or unknown `status` opens the disputed queue. */
export function reviewModerationFiltersFromParams(params: URLSearchParams): ReviewModerationFilters {
  const status = params.get("status") ?? "";
  const page = Number(params.get("page"));
  return {
    status: isStatus(status) ? status : DEFAULT_REVIEW_MODERATION_STATUS,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function reviewModerationFiltersToParams(filters: ReviewModerationFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status !== DEFAULT_REVIEW_MODERATION_STATUS) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function reviewModerationQueryString(filters: ReviewModerationFilters): string {
  return new URLSearchParams({ status: filters.status, per_page: String(REVIEW_MODERATION_PER_PAGE), page: String(filters.page) }).toString();
}
