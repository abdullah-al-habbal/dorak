import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { serviceTermsSchema } from "@/schemas/service-terms.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ServiceTerms } from "@/types/services/service-terms.type";

export interface ServiceOverridePayload {
  brand_id: string;
  /** Left out (or null) to keep the barber's default price. */
  price_amount_minor?: number | null;
  /** Left out (or null) to keep the barber's default duration. */
  duration_minutes?: number | null;
}

function overridePath(barberId: string, serviceId: string): string {
  return `${DASHBOARD_API}/barbers/${encodeURIComponent(barberId)}/services/${encodeURIComponent(serviceId)}/override`;
}

export function saveServiceOverride(barberId: string, serviceId: string, payload: ServiceOverridePayload): Promise<ServiceTerms> {
  return apiRequest(overridePath(barberId, serviceId), { method: HttpMethod.Put, body: payload, schema: serviceTermsSchema });
}

export async function clearServiceOverride(barberId: string, serviceId: string, brandId: string): Promise<void> {
  const params = new URLSearchParams({ brand_id: brandId });
  await apiRequest(`${overridePath(barberId, serviceId)}?${params.toString()}`, { method: HttpMethod.Delete, schema: z.unknown() });
}
