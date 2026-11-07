import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { ChairPayload } from "@/interfaces/chair-payload.interface";
import { chairSchema } from "@/schemas/chair.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Chair } from "@/types/chair.type";

const CHAIRS = `${DASHBOARD_API}/chairs`;

export function createChair(payload: ChairPayload): Promise<Chair> {
  return apiRequest(CHAIRS, { method: HttpMethod.Post, body: payload, schema: chairSchema });
}

export function updateChair(id: string, payload: ChairPayload): Promise<Chair> {
  return apiRequest(`${CHAIRS}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: chairSchema });
}
