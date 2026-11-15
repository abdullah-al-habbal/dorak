import { BRAND_HISTORY_PER_PAGE } from "@/config/admin-brand.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { statusChangeLogListSchema } from "@/schemas/status-change-log.zod";
import { apiRequest } from "@/services/api/core/client";
import type { StatusChangeLog } from "@/types/core/status-change-log.type";

/** The status-change log of one subject (`brand` or `branch`), newest first. */
export function fetchStatusHistory(subjectType: string, id: string): Promise<StatusChangeLog[]> {
  return apiRequest(`${DASHBOARD_API}/admin/audit/${subjectType}/${encodeURIComponent(id)}?per_page=${BRAND_HISTORY_PER_PAGE}`, { schema: statusChangeLogListSchema });
}
