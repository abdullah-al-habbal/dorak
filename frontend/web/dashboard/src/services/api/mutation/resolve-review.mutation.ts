import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { ReviewResolvePayload } from "@/interfaces/clients/review-resolve-payload.interface";
import { adminReviewSchema } from "@/schemas/admin-review.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminReview } from "@/types/clients/admin-review.type";

export function resolveReview({ id, status, note }: ReviewResolvePayload): Promise<AdminReview> {
  return apiRequest(`${DASHBOARD_API}/admin/reviews/${encodeURIComponent(id)}/resolve`, { method: HttpMethod.Patch, body: { status, note }, schema: adminReviewSchema });
}
