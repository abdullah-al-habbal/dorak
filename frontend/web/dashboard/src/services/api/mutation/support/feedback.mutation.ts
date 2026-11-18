import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import type { FeedbackUpdatePayload } from "@/interfaces/support/feedback-update-payload.interface";
import { feedbackReportSchema } from "@/schemas/support/feedback-report.zod";
import { apiRequest } from "@/services/api/core/client";
import type { FeedbackReport } from "@/types/support/feedback-report.type";

export function updateFeedbackReport({ id, ...body }: FeedbackUpdatePayload): Promise<FeedbackReport> {
  return apiRequest(`${DASHBOARD_API}/admin/feedback/${encodeURIComponent(id)}`, { method: HttpMethod.Patch, body, schema: feedbackReportSchema });
}
