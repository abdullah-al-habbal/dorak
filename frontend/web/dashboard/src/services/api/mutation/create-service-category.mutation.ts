import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { ServiceCategoryPayload } from "@/interfaces/service-category-payload.interface";
import { serviceCategorySchema } from "@/schemas/service-category.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ServiceCategory } from "@/types/service-category.type";

export function createServiceCategory(payload: ServiceCategoryPayload): Promise<ServiceCategory> {
  return apiRequest(`${DASHBOARD_API}/service-categories`, { method: HttpMethod.Post, body: payload, schema: serviceCategorySchema });
}
