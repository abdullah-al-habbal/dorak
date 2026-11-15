import { DASHBOARD_API } from "@/config/routes.constant";
import { serviceOptionListSchema } from "@/schemas/service-option.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ServiceOption } from "@/types/services/service-option.type";

const MAX_PER_PAGE = 100;

export function fetchServiceOptions(): Promise<ServiceOption[]> {
  return apiRequest(`${DASHBOARD_API}/services?per_page=${MAX_PER_PAGE}`, { schema: serviceOptionListSchema });
}
