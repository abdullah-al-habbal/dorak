import { DASHBOARD_API } from "@/config/routes.constant";
import { serviceTermsListSchema } from "@/schemas/services/service-terms.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ServiceTerms } from "@/types/services/service-terms.type";

export function fetchStylistServiceTerms(barberId: string, brandId: string): Promise<ServiceTerms[]> {
  const params = new URLSearchParams({ brand_id: brandId });
  return apiRequest(`${DASHBOARD_API}/barbers/${encodeURIComponent(barberId)}/services?${params.toString()}`, { schema: serviceTermsListSchema });
}
