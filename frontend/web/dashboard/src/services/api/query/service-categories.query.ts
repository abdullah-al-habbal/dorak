import { DASHBOARD_API } from "@/config/routes.constant";
import { serviceCategoryListSchema } from "@/schemas/service-category.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ServiceCategory } from "@/types/service-category.type";

export function fetchServiceCategories(): Promise<ServiceCategory[]> {
  return apiRequest(`${DASHBOARD_API}/service-categories`, { schema: serviceCategoryListSchema });
}
