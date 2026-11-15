import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { ServicePayload } from "@/interfaces/services/service-payload.interface";
import { serviceSchema } from "@/schemas/service.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Service } from "@/types/services/service.type";

const SERVICES = `${DASHBOARD_API}/services`;

export function createService(payload: ServicePayload): Promise<Service> {
  return apiRequest(SERVICES, { method: HttpMethod.Post, body: payload, schema: serviceSchema });
}

export function updateService(id: string, payload: ServicePayload): Promise<Service> {
  return apiRequest(`${SERVICES}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: serviceSchema });
}

export async function deleteService(id: string): Promise<void> {
  await apiRequest(`${SERVICES}/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}
