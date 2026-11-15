import { DASHBOARD_API } from "@/config/routes.constant";
import { serviceCategoryListSchema } from "@/schemas/services/service-category.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ServiceCategory } from "@/types/services/service-category.type";

export function fetchServiceCategories(): Promise<ServiceCategory[]> {
  return apiRequest(`${DASHBOARD_API}/service-categories`, { schema: serviceCategoryListSchema });
}
