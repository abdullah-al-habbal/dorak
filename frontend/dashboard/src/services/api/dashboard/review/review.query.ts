import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import { parseReviewStatus } from "@/services/api/dashboard/review/review-enum.util";
import type { IBranchReview } from "@/services/api/dashboard/review/types/ireview.types";
import type { IDashboardPage } from "@/services/api/dashboard/shared/types/idashboard-page.types";
import { isRecord } from "@/utils/guards.util";

export const branchReviewsQueryKey = (branchId: string, page: number) =>
  ["dashboard", "branch-reviews", branchId, page] as const;

export function mapBranchReview(wire: unknown): IBranchReview {
  const item = isRecord(wire) ? wire : {};
  const nullableText = (value: unknown) =>
    typeof value === "string" ? value : null;
  return {
    id: String(item.id ?? ""),
    rating: typeof item.rating === "number" ? item.rating : 0,
    comment: nullableText(item.comment),
    authorName: nullableText(item.author_name),
    status: parseReviewStatus(item.status),
    createdAt: String(item.created_at ?? ""),
  };
}

export async function getBranchReviews(
  branchId: string,
  page: number,
): Promise<IDashboardPage<IBranchReview>> {
  const result = await api.get<IDashboardPage<unknown>>(
    `${DashboardEndpoints.branchReviews(branchId)}?page=${page}`,
  );
  return { ...result, items: result.items.map(mapBranchReview) };
}
