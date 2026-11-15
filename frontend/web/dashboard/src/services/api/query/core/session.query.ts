import { API_ROUTE } from "@/config/routes.constant";
import { sessionPayloadSchema } from "@/schemas/core/session/session-payload.zod";
import { apiRequest } from "@/services/api/core/client";
import type { SessionPayload } from "@/types/core/session/session-payload.type";

export function sessionQuery(): Promise<SessionPayload> {
  return apiRequest(API_ROUTE.me, { schema: sessionPayloadSchema });
}
